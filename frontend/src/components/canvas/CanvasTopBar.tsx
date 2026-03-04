import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvasStore } from '../../stores/canvasStore';
import { useCollabStore } from '../../stores/collabStore';
import { useUserStore } from '../../stores/userStore';
import { useUIStore } from '../../stores/uiStore';
import toast from 'react-hot-toast';

interface Props {
  projectId: string;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
  onNavigateBack: () => void;
}

export default function CanvasTopBar({
  projectId,
  onToggleLeft,
  onToggleRight,
  leftOpen,
  rightOpen,
  onNavigateBack,
}: Props) {
  const navigate = useNavigate();
  const { syncToServer, isWhatIfMode, toggleWhatIfMode } = useCanvasStore();
  const { collaborators } = useCollabStore();
  useUserStore();
  const { setCommandPaletteOpen } = useUIStore();
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [editingName, setEditingName] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await syncToServer(projectId);
      toast.success('Saved', { duration: 1500 });
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  // handleCheckpoint removed — no checkpoint button in this bar

  const onlineCollabs = collaborators.filter((c) => c.isOnline);

  return (
    <div className="h-12 border-b border-[var(--border)] flex items-center px-3 gap-2 shrink-0 bg-[var(--bg-sidebar)] z-30">
      {/* Back button */}
      <button
        onClick={onNavigateBack}
        className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
        aria-label="Back to workspace"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>

      {/* Logo */}
      <span className="font-display font-extrabold text-base gradient-text hidden sm:block tracking-tight">CreatiAI</span>
      <div className="w-px h-5 bg-[var(--border)] mx-2" />

      {/* Toggle left panel */}
      <button
        onClick={onToggleLeft}
        className={`p-1.5 rounded-lg transition-all duration-200 ${
          leftOpen ? 'bg-[var(--purple)]/15 text-[var(--purple)] shadow-[inset_0_0_0_1px_rgba(147,51,234,0.3)]' : 'hover:bg-[var(--bg-hover)] text-[var(--text-muted)]'
        }`}
        aria-label="Toggle AI panel"
        title="Toggle AI Co-Creator (⌘B)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
      </button>

      {/* Project title */}
      <div className="flex-1 flex items-center justify-center min-w-0 px-4">
        {editingName ? (
          <input
            autoFocus
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
            className="text-center font-display font-semibold text-sm text-[var(--text-primary)] bg-[var(--bg-input)] border border-[var(--purple)]/50 rounded-lg px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--purple)]/20 max-w-xs shadow-[0_0_15px_rgba(147,51,234,0.1)]"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="font-display font-semibold text-sm text-[var(--text-primary)] hover:text-[var(--purple)] transition-colors truncate max-w-xs px-3 py-1 rounded-lg hover:bg-[var(--bg-hover)]"
          >
            {projectName}
          </button>
        )}
      </div>

      {/* What-If mode toggle */}
      <button
        onClick={toggleWhatIfMode}
        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-300 flex items-center gap-1.5 ${
          isWhatIfMode
            ? 'bg-[var(--gold)]/15 border border-[var(--gold)]/50 text-[var(--gold)] shadow-[0_0_15px_rgba(217,119,6,0.2)]'
            : 'border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--gold)]/40 hover:text-[var(--gold)] hover:bg-[var(--gold)]/5'
        }`}
        title="Toggle What-If Mode (⌘W)"
      >
        <span className={isWhatIfMode ? 'animate-pulse' : ''}>⚠</span>
        what-if
      </button>

      {/* Command palette shortcut */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-xs font-mono text-[var(--text-muted)] hover:border-[var(--purple)]/40 hover:text-[var(--purple)] transition-all duration-200 shadow-sm"
        title="Open command palette (⌘K)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span>⌘K</span>
      </button>

      {/* Online collaborators */}
      {onlineCollabs.length > 0 && (
        <div className="flex items-center -space-x-1">
          {onlineCollabs.slice(0, 4).map((collab) => (
            <div
              key={collab.id}
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-display font-bold"
              style={{
                borderColor: collab.cursorColor || 'var(--purple)',
                background: `${collab.cursorColor || 'var(--purple)'}30`,
                color: collab.cursorColor || 'var(--purple)',
              }}
              title={collab.user?.name}
            >
              {collab.user?.name?.[0]?.toUpperCase() || '?'}
            </div>
          ))}
          {onlineCollabs.length > 4 && (
            <div className="w-6 h-6 rounded-full border-2 border-[var(--border)] bg-[var(--bg-hover)] flex items-center justify-center font-mono text-xs text-[var(--text-muted)]">
              +{onlineCollabs.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Share */}
      <button
        onClick={() => navigate(`/workspace/${projectId}/collaborate`)}
        className="px-4 py-1.5 rounded-lg text-xs font-display font-bold tracking-wide uppercase bg-[var(--purple)]/10 border border-[var(--purple)]/30 text-[var(--purple)] hover:bg-[var(--purple)] hover:text-white hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300"
      >
        Share
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-1.5 rounded-lg text-xs font-display font-bold tracking-wide uppercase btn-gradient disabled:opacity-50 shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] transition-all duration-300"
        title="Save (⌘S)"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>

      {/* Toggle right panel */}
      <button
        onClick={onToggleRight}
        className={`p-1.5 rounded-lg transition-all duration-200 ml-1 ${
          rightOpen ? 'bg-[var(--cyan)]/15 text-[var(--cyan)] shadow-[inset_0_0_0_1px_rgba(8,145,178,0.3)]' : 'hover:bg-[var(--bg-hover)] text-[var(--text-muted)]'
        }`}
        aria-label="Toggle right panel"
        title="Toggle Context Panel"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/>
        </svg>
      </button>
    </div>
  );
}
