import { useCanvasStore } from '../../stores/canvasStore';
import { useCollabStore } from '../../stores/collabStore';
import { useAIStore } from '../../stores/aiStore';
import { useNavigate } from 'react-router-dom';

interface Props {
  projectId: string;
  undoCount: number;
  redoCount: number;
  onUndo: () => void;
  onRedo: () => void;
}

export default function BottomStatusBar({ projectId, undoCount, redoCount, onUndo, onRedo }: Props) {
  const navigate = useNavigate();
  const { nodes, edges, isWhatIfMode } = useCanvasStore();
  const { isConnected, collaborators } = useCollabStore();
  const { isStreaming } = useAIStore();

  const onlineCount = collaborators.filter((c: { isOnline?: boolean }) => c.isOnline).length;

  return (
    <div className="h-10 border-t border-[var(--border)] flex items-center px-4 gap-4 shrink-0 bg-[var(--bg-sidebar)] text-[var(--text-muted)] font-mono text-xs z-30 relative">
      {/* Left: canvas stats */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-[var(--purple)]/50 border border-[var(--purple)]" />
          {nodes.length} node{nodes.length !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--cyan)]">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          {edges.length} edge{edges.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="w-px h-4 bg-[var(--border)]" />

      {/* Undo/redo counts */}
      <div className="flex items-center gap-3">
        <button
          onClick={onUndo}
          disabled={undoCount === 0}
          className="hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors flex items-center gap-1"
          title="Undo (⌘Z)"
        >
          <span>↩</span> {undoCount}
        </button>
        <button
          onClick={onRedo}
          disabled={redoCount === 0}
          className="hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors flex items-center gap-1"
          title="Redo (⌘⇧Z)"
        >
          <span>↪</span> {redoCount}
        </button>
      </div>

      <div className="flex-1" />

      {/* What-If mode */}
      {isWhatIfMode && (
        <span className="text-[var(--gold)] font-bold tracking-widest uppercase text-[10px] flex items-center gap-1.5 bg-[var(--gold)]/10 px-2 py-0.5 rounded border border-[var(--gold)]/30">
          <span className="animate-pulse">⚠</span> WHAT-IF
        </span>
      )}

      {/* AI streaming indicator */}
      {isStreaming && (
        <span className="text-[var(--cyan)] flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse shadow-[0_0_8px_rgba(8,145,178,0.8)]" />
          thinking…
        </span>
      )}

      {/* Collab status */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border)]">
        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[var(--success)] shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-[var(--text-muted)]'}`} />
        <span className={isConnected ? 'text-[var(--text-secondary)]' : ''}>
          {isConnected ? (onlineCount > 1 ? `${onlineCount} online` : 'connected') : 'offline'}
        </span>
      </div>

      <div className="w-px h-4 bg-[var(--border)]" />

      {/* History shortcut */}
      <button
        onClick={() => navigate(`/workspace/${projectId}/history`)}
        className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
        title="Version history"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        history
      </button>

      <button
        onClick={() => navigate(`/workspace/${projectId}/export`)}
        className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
        title="Export"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
        </svg>
        export
      </button>
    </div>
  );
}
