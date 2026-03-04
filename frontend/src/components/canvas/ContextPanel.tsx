import { useState } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useCollabStore } from '../../stores/collabStore';
import type { Comment } from '../../types';

type Tab = 'properties' | 'diff' | 'connections' | 'comments';

interface Props {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  projectId: string;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'properties', label: 'Properties', icon: '⚙' },
  { id: 'diff', label: 'Diff', icon: '±' },
  { id: 'connections', label: 'Links', icon: '🔗' },
  { id: 'comments', label: 'Comments', icon: '💬' },
];

export default function ContextPanel({ tab, onTabChange }: Props) {
  const { nodes, edges, selectedNodes } = useCanvasStore();
  const { comments } = useCollabStore();
  const [newComment, setNewComment] = useState('');

  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-sidebar)] border-l border-[var(--border)] shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.5)] relative z-20">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--border)] shrink-0 bg-gradient-to-b from-[var(--bg-card)] to-transparent px-2 pt-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1.5 text-xs font-display font-semibold transition-all duration-300 border-b-2 rounded-t-xl ${
              tab === t.id
                ? 'border-[var(--cyan)] text-[var(--cyan)] bg-[var(--cyan)]/5 shadow-[inset_0_-2px_10px_rgba(8,145,178,0.1)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span className="text-base">{t.icon}</span>
            <span className="tracking-wide uppercase text-[10px]">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent">
        {/* Properties */}
        {tab === 'properties' && (
          <div className="space-y-6">
            {selectedNode ? (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-inner space-y-4">
                  <div>
                    <p className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-muted)] mb-1.5">Node ID</p>
                    <p className="font-mono text-xs text-[var(--text-secondary)] break-all bg-[var(--bg-input)] p-2 rounded-lg border border-[var(--border)]">{selectedNode.id}</p>
                  </div>
                  <div>
                    <p className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-muted)] mb-1.5">Type</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[var(--cyan)]/10 border border-[var(--cyan)]/30 font-mono font-bold tracking-widest uppercase text-[10px] text-[var(--cyan)] shadow-[0_0_10px_rgba(8,145,178,0.1)]">
                      {selectedNode.type}
                    </span>
                  </div>
                  <div>
                    <p className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-muted)] mb-1.5">Position</p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[var(--bg-input)] p-2 rounded-lg border border-[var(--border)] flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[var(--text-muted)]">X</span>
                        <span className="font-mono text-xs text-[var(--text-secondary)]">{Math.round(selectedNode.position.x)}</span>
                      </div>
                      <div className="flex-1 bg-[var(--bg-input)] p-2 rounded-lg border border-[var(--border)] flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[var(--text-muted)]">Y</span>
                        <span className="font-mono text-xs text-[var(--text-secondary)]">{Math.round(selectedNode.position.y)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-muted)] mb-3 px-1">Connections</p>
                  <div className="space-y-2">
                    {edges
                      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map((edge) => (
                        <div key={edge.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--cyan)]/50 transition-colors group">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${edge.source === selectedNode.id ? 'bg-[var(--cyan)]/20 text-[var(--cyan)]' : 'bg-[var(--purple)]/20 text-[var(--purple)]'}`}>
                            <span className="text-xs">{edge.source === selectedNode.id ? '→' : '←'}</span>
                          </div>
                          <span className="font-mono text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors truncate">
                            {edge.source === selectedNode.id ? edge.target : edge.source}
                          </span>
                        </div>
                      ))}
                    {edges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id).length === 0 && (
                      <div className="p-4 rounded-xl border border-dashed border-[var(--border)] text-center">
                        <p className="font-body text-xs text-[var(--text-muted)]">No connections</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4 opacity-60">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--cyan)]/10 to-[var(--purple)]/10 flex items-center justify-center border border-[var(--border)] shadow-[0_0_30px_rgba(8,145,178,0.1)]">
                  <span className="text-3xl text-[var(--text-muted)]">↖</span>
                </div>
                <p className="font-body text-sm text-[var(--text-secondary)] text-center max-w-[180px] leading-relaxed">
                  {selectedNodes.length > 1
                    ? `${selectedNodes.length} nodes selected`
                    : 'Select a node to see its properties'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Diff */}
        {tab === 'diff' && (
          <div className="space-y-4">
            <p className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-muted)] px-1">
              Changes since last checkpoint:
            </p>
            <div className="space-y-3">
              {nodes.slice(0, 5).map((node) => (
                <div key={node.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <div className="w-6 h-6 rounded-full bg-[var(--success)]/20 flex items-center justify-center text-[var(--success)] font-mono font-bold">
                    +
                  </div>
                  <span className="font-mono text-xs text-[var(--text-secondary)] truncate max-w-[120px]">
                    {node.id.substring(0, 12)}…
                  </span>
                  <span className="ml-auto font-mono font-bold tracking-widest uppercase text-[10px] text-[var(--success)] bg-[var(--success)]/20 px-2 py-1 rounded-md">{node.type}</span>
                </div>
              ))}
              {nodes.length === 0 && (
                <div className="p-6 rounded-2xl border border-dashed border-[var(--border)] text-center opacity-60">
                  <p className="font-body text-sm text-[var(--text-muted)]">No changes</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connections */}
        {tab === 'connections' && (
          <div className="space-y-4">
            <p className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-muted)] px-1">
              {edges.length} edge{edges.length !== 1 ? 's' : ''} in this canvas
            </p>
            <div className="space-y-3">
              {edges.map((edge) => (
                <div key={edge.id} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--purple)]/40 transition-colors shadow-sm">
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-[var(--text-secondary)] truncate max-w-[80px] bg-[var(--bg-input)] px-2 py-1 rounded-md border border-[var(--border)]">{edge.source.substring(0, 10)}</span>
                    <span className="text-[var(--purple)] font-bold">→</span>
                    <span className="text-[var(--text-secondary)] truncate max-w-[80px] bg-[var(--bg-input)] px-2 py-1 rounded-md border border-[var(--border)]">{edge.target.substring(0, 10)}</span>
                  </div>
                  {edge.label && (
                    <p className="mt-3 font-body text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] p-2 rounded-lg border border-[var(--border)]">{edge.label}</p>
                  )}
                </div>
              ))}
              {edges.length === 0 && (
                <div className="p-6 rounded-2xl border border-dashed border-[var(--border)] text-center opacity-60">
                  <p className="font-body text-sm text-[var(--text-muted)] leading-relaxed">No connections yet. Drag between nodes to connect them.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comments */}
        {tab === 'comments' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {comments.length === 0 && (
                <p className="font-body text-xs text-[var(--text-muted)]">No comments yet.</p>
              )}
              {comments.map((comment: Comment) => (
                <div key={comment.id} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-[var(--purple)]/30 flex items-center justify-center font-display text-xs text-[var(--purple)]">
                      {comment.authorId[0]?.toUpperCase()}
                    </div>
                    <span className="font-body text-xs text-[var(--text-muted)]">{comment.authorId}</span>
                    <span className="ml-auto font-mono text-xs text-[var(--text-muted)]">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-body text-sm text-[var(--text-secondary)]">{comment.content}</p>
                </div>
              ))}
            </div>
            {/* New comment */}
            <div className="space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment…"
                rows={2}
                className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--purple)] transition-colors"
              />
              <button
                disabled={!newComment.trim()}
                className="w-full py-2 rounded-xl text-xs font-body btn-gradient disabled:opacity-40"
              >
                Post Comment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
