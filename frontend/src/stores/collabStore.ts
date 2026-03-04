import { create } from 'zustand';
import type { Collaborator, CursorPosition, Comment, SessionEvent } from '../types';

interface CollabStore {
  collaborators: Collaborator[];
  cursors: Record<string, CursorPosition>;
  comments: Comment[];
  sessionEvents: SessionEvent[];
  isConnected: boolean;
  socketId: string | null;
  presenceVisible: boolean;

  setCollaborators: (collaborators: Collaborator[]) => void;
  updateCursor: (userId: string, cursor: CursorPosition) => void;
  removeCursor: (userId: string) => void;
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  removeComment: (id: string) => void;
  addSessionEvent: (event: SessionEvent) => void;
  setConnected: (connected: boolean, socketId?: string) => void;
  togglePresence: () => void;
  // Aliases used by useSocket
  setSocketId: (id: string) => void;
  addCollaborator: (collaborator: Collaborator) => void;
  removeCollaborator: (userId: string) => void;
}

export const useCollabStore = create<CollabStore>()((set) => ({
  collaborators: [],
  cursors: {},
  comments: [],
  sessionEvents: [],
  isConnected: false,
  socketId: null,
  presenceVisible: true,

  setCollaborators: (collaborators) => set({ collaborators }),

  updateCursor: (userId, cursor) =>
    set((s) => ({ cursors: { ...s.cursors, [userId]: cursor } })),

  removeCursor: (userId) =>
    set((s) => {
      const cursors = { ...s.cursors };
      delete cursors[userId];
      return { cursors };
    }),

  setComments: (comments) => set({ comments }),

  addComment: (comment) =>
    set((s) => ({ comments: [comment, ...s.comments] })),

  updateComment: (id, updates) =>
    set((s) => ({
      comments: s.comments.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  removeComment: (id) =>
    set((s) => ({ comments: s.comments.filter((c) => c.id !== id) })),

  addSessionEvent: (event) =>
    set((s) => ({ sessionEvents: [...s.sessionEvents, event] })),

  setConnected: (connected, socketId) =>
    set({ isConnected: connected, socketId: socketId || null }),

  togglePresence: () => set((s) => ({ presenceVisible: !s.presenceVisible })),

  setSocketId: (id) => set({ socketId: id }),

  addCollaborator: (collaborator) =>
    set((s) => ({
      collaborators: [...s.collaborators.filter(c => c.userId !== collaborator.userId), collaborator],
    })),

  removeCollaborator: (userId) =>
    set((s) => ({
      collaborators: s.collaborators.filter((c) => c.userId !== userId),
    })),
}));
