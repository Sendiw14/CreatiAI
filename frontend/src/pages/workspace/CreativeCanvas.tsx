import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  NodeTypes,
  useReactFlow,
  ReactFlowProvider,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';

import { useCanvasStore } from '../../stores/canvasStore';
import { useAIStore } from '../../stores/aiStore';
import { useUIStore } from '../../stores/uiStore';
import { useUserStore } from '../../stores/userStore';

import AICoCreatorPanel from '../../components/ai/AICoCreatorPanel';
import ContextPanel from '../../components/canvas/ContextPanel';
import CanvasTopBar from '../../components/canvas/CanvasTopBar';
import CanvasToolbar from '../../components/canvas/CanvasToolbar';
import BottomStatusBar from '../../components/canvas/BottomStatusBar';
import TextNode from '../../components/canvas/nodes/TextNode';
import ImageNode from '../../components/canvas/nodes/ImageNode';
import AIGeneratedNode from '../../components/canvas/nodes/AIGeneratedNode';
import SketchNode from '../../components/canvas/nodes/SketchNode';
import GroupNode from '../../components/canvas/nodes/GroupNode';
import CollabCursors from '../../components/canvas/CollabCursors';
import CommandPalette from '../../components/ui/CommandPalette';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useSocket } from '../../hooks/useSocket';

const nodeTypes: NodeTypes = {
  text: TextNode,
  image: ImageNode,
  ai_generated: AIGeneratedNode,
  sketch: SketchNode,
  group: GroupNode,
};

function CanvasInner() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reactFlow = useReactFlow();

  const {
    nodes, edges, viewport,
    addNode, addEdge: storeAddEdge, updateNode, deleteNode,
    setViewport, loadFromServer, toggleWhatIfMode, isWhatIfMode,
    toggleGrid, gridVisible, undo, redo, undoStack, redoStack,
    syncToServer, fitView,
  } = useCanvasStore();

  useUIStore();
  const { user } = useUserStore();
  useAIStore();

  const [showRightPanel, setShowRightPanel] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'properties' | 'diff' | 'connections' | 'comments'>('properties');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuTarget, setContextMenuTarget] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Load project canvas from server
  useEffect(() => {
    if (projectId) loadFromServer(projectId);
  }, [projectId, loadFromServer]);

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (projectId) syncToServer(projectId);
    }, 30000);
    return () => clearInterval(interval);
  }, [projectId, syncToServer]);

  // Socket connection for collab
  useSocket(projectId);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'mod+z': undo,
    'mod+shift+z': redo,
    'mod+y': redo,
    'mod+f': () => fitView(),
    'mod+g': toggleGrid,
    'mod+w': toggleWhatIfMode,
    'Escape': () => setContextMenuPos(null),
  });

  const handleConnect = useCallback(
    (connection: Connection) => {
      storeAddEdge({
        id: `e-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        sourceId: connection.source!,
        targetId: connection.target!,
      });
    },
    [storeAddEdge]
  );

  const handleNodeContextMenu = useCallback((e: React.MouseEvent, node: { id: string }) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuTarget(node.id);
  }, []);

  const handlePaneContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuTarget(null);
  }, []);

  const handlePaneClick = useCallback(() => {
    setContextMenuPos(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/creati-node');
      if (!type) return;
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const position = reactFlow.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });
      addNode({
        id: `node-${Date.now()}`,
        type: type as 'text' | 'image' | 'sketch' | 'ai_generated' | 'group',
        position,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        content: '',
        createdBy: user?.id || 'local',
      });
    },
    [reactFlow, addNode, user?.id]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg-page)] flex flex-col">
      {/* Top Bar */}
      <CanvasTopBar
        projectId={projectId || ''}
        onToggleLeft={() => setShowLeftPanel((v) => !v)}
        onToggleRight={() => setShowRightPanel((v) => !v)}
        leftOpen={showLeftPanel}
        rightOpen={showRightPanel}
        onNavigateBack={() => navigate('/workspace')}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── Left: AI Co-Creator Panel ─── */}
        <AnimatePresence>
          {showLeftPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 overflow-hidden border-r border-[var(--border)] bg-[var(--bg-sidebar)] flex flex-col"
              style={{ minWidth: 0 }}
            >
              <AICoCreatorPanel projectId={projectId || ''} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Center: Canvas ─── */}
        <div
          ref={canvasRef}
          className={`flex-1 relative overflow-hidden ${isWhatIfMode ? 'whatif-frame' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <ReactFlow
            nodes={nodes as unknown as import('reactflow').Node[]}
            edges={edges as unknown as import('reactflow').Edge[]}
            onNodesChange={(changes) => {
              // handled by canvasStore via immer
              changes.forEach((change) => {
                if (change.type === 'position' && change.position) {
                  updateNode(change.id, { position: change.position });
                }
                if (change.type === 'remove') {
                  deleteNode(change.id);
                }
              });
            }}
            onEdgesChange={() => {}}
            onConnect={handleConnect}
            onNodeContextMenu={handleNodeContextMenu}
            onPaneContextMenu={handlePaneContextMenu}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            defaultViewport={viewport}
            onMove={(_e, vp) => setViewport(vp)}
            proOptions={{ hideAttribution: true }}
            fitViewOptions={{ padding: 0.1 }}
            minZoom={0.1}
            maxZoom={4}
            className="bg-transparent"
          >
            {gridVisible && (
              <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1}
                color="var(--canvas-grid-dot)"
                className="opacity-40"
              />
            )}
            <Controls
              className="!bg-[var(--bg-card)] !border-[var(--border)] !rounded-xl overflow-hidden"
              showInteractive={false}
            />
            <MiniMap
              className="!bg-[var(--bg-card)] !border-[var(--border)] !rounded-xl"
              nodeColor={(node) => {
                const colors: Record<string, string> = {
                  text: 'var(--purple)',
                  image: 'var(--cyan)',
                  ai_generated: 'var(--gold)',
                  sketch: '#a8e6a3',
                  group: 'var(--border-active)',
                };
                return colors[node.type || 'text'] || 'var(--border)';
              }}
              maskColor="rgba(8,9,16,0.7)"
            />
          </ReactFlow>

          {/* Collab cursors overlay */}
          <CollabCursors canvasRef={canvasRef} />

          {/* Floating canvas toolbar */}
          <CanvasToolbar />

          {/* Context menu */}
          <AnimatePresence>
            {contextMenuPos && (
              <ContextMenu
                pos={contextMenuPos}
                nodeId={contextMenuTarget}
                onClose={() => setContextMenuPos(null)}
                onAddNode={(type) => {
                  const pos = reactFlow.screenToFlowPosition(contextMenuPos);
                  addNode({
                    id: `node-${Date.now()}`,
                    type,
                    position: pos,
                    title: type.charAt(0).toUpperCase() + type.slice(1),
                    content: '',
                    createdBy: user?.id || 'local',
                  });
                  setContextMenuPos(null);
                }}
                onDeleteNode={(nodeId) => {
                  deleteNode(nodeId);
                  setContextMenuPos(null);
                }}
              />
            )}
          </AnimatePresence>

          {/* What-If mode badge */}
          <AnimatePresence>
            {isWhatIfMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-mono font-semibold border border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)] z-20"
              >
                ⚠ WHAT-IF MODE — changes won't affect main branch
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Right: Context Panel ─── */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 overflow-hidden border-l border-[var(--border)] bg-[var(--bg-sidebar)] flex flex-col"
              style={{ minWidth: 0 }}
            >
              <ContextPanel
                tab={rightPanelTab}
                onTabChange={setRightPanelTab}
                projectId={projectId || ''}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Status Bar */}
      <BottomStatusBar
        projectId={projectId || ''}
        undoCount={undoStack.length}
        redoCount={redoStack.length}
        onUndo={undo}
        onRedo={redo}
      />

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}

function ContextMenu({ pos, nodeId, onClose, onAddNode, onDeleteNode }: {
  pos: { x: number; y: number };
  nodeId: string | null;
  onClose: () => void;
  onAddNode: (type: 'text' | 'image' | 'sketch' | 'ai_generated' | 'group') => void;
  onDeleteNode: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999 }}
      className="glass rounded-xl border border-[var(--border)] overflow-hidden shadow-xl min-w-[180px]"
    >
      {nodeId ? (
        <>
          <CtxItem icon="🔗" label="Add connection" onClick={onClose} />
          <CtxItem icon="📋" label="Duplicate" onClick={onClose} />
          <CtxItem icon="🗑" label="Delete node" danger onClick={() => onDeleteNode(nodeId)} />
        </>
      ) : (
        <>
          <p className="px-4 pt-3 pb-1 font-mono text-xs text-[var(--text-muted)] uppercase tracking-widest">Add node</p>
          <CtxItem icon="📝" label="Text" onClick={() => onAddNode('text')} />
          <CtxItem icon="🖼" label="Image" onClick={() => onAddNode('image')} />
          <CtxItem icon="✏️" label="Sketch" onClick={() => onAddNode('sketch')} />
          <CtxItem icon="✦" label="AI Generated" onClick={() => onAddNode('ai_generated')} />
          <div className="border-t border-[var(--border)] my-1" />
          <CtxItem icon="⬛" label="Group" onClick={() => onAddNode('group')} />
        </>
      )}
    </motion.div>
  );
}

function CtxItem({ icon, label, onClick, danger }: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm font-body hover:bg-[var(--bg-hover)] transition-colors ${
        danger ? 'text-red-400 hover:bg-red-500/10' : 'text-[var(--text-secondary)]'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// Wrap with ReactFlowProvider
export default function CreativeCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
