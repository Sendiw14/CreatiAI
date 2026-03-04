import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCollabStore } from '../stores/collabStore';
import { useCanvasStore } from '../stores/canvasStore';
import { useUserStore } from '../stores/userStore';

let socket: Socket | null = null;

export function useSocket(projectId?: string) {
  const { setConnected, setSocketId, updateCursor, addCollaborator, removeCollaborator } = useCollabStore();
  const { updateNode } = useCanvasStore();
  const { user } = useUserStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!projectId || !user || initialized.current) return;
    initialized.current = true;

    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

    socket = io(WS_URL, {
      auth: { token: localStorage.getItem('accessToken') },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setConnected(true);
      setSocketId(socket!.id || '');
      socket!.emit('join-project', { projectId, userId: user.id, name: user.name });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('user-joined', (data: { userId: string; name: string; cursorColor: string }) => {
      addCollaborator({
        id: `${data.userId}-${projectId}`,
        projectId,
        userId: data.userId,
        role: 'editor',
        joinedAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        cursorColor: data.cursorColor,
        isOnline: true,
        user: { name: data.name } as never,
      });
    });

    socket.on('user-left', (data: { userId: string }) => {
      removeCollaborator(data.userId);
    });

    socket.on('cursor-move', (data: { userId: string; name: string; color: string; x: number; y: number }) => {
      updateCursor(data.userId, { userId: data.userId, name: data.name, color: data.color, x: data.x, y: data.y });
    });

    socket.on('node-update', (data: { nodeId: string; updates: Record<string, unknown> }) => {
      updateNode(data.nodeId, data.updates);
    });

    return () => {
      socket?.disconnect();
      socket = null;
      initialized.current = false;
    };
  }, [projectId, user?.id]);

  // Emit cursor position on mouse move
  useEffect(() => {
    if (!socket || !projectId) return;

    const handleMouseMove = (e: MouseEvent) => {
      socket!.emit('cursor-move', {
        projectId,
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [projectId]);

  return socket;
}
