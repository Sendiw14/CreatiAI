import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'
import api from '../../lib/api'

interface VersionEntry {
  id: string
  version: number
  label: string
  description?: string
  nodeCount: number
  edgeCount: number
  createdAt: string
  createdBy: string
  isCheckpoint: boolean
  thumbnailUrl?: string
}

export default function VersionHistoryPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedVersion, setSelectedVersion] = useState<VersionEntry | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareA, setCompareA] = useState<string | null>(null)
  const [compareB, setCompareB] = useState<string | null>(null)

  // Mock versions
  const MOCK_VERSIONS: VersionEntry[] = Array.from({ length: 18 }, (_, i) => ({
    id: `v-${18 - i}`,
    version: 18 - i,
    label: i === 0 ? 'Current' : i === 3 ? 'Checkpoint: Brand lock' : i === 8 ? 'Checkpoint: Initial concept' : `Version ${18 - i}`,
    description: i === 3 ? 'Locked brand direction after team review' : undefined,
    nodeCount: Math.max(3, 12 - i + Math.floor(Math.random() * 3)),
    edgeCount: Math.max(1, 8 - i + Math.floor(Math.random() * 2)),
    createdAt: new Date(Date.now() - i * 3600000 * 4).toISOString(),
    createdBy: ['You', 'Alex Kim', 'Sam Rivera'][i % 3],
    isCheckpoint: i === 0 || i === 3 || i === 8,
  }))

  const { data: versions = MOCK_VERSIONS, isLoading } = useQuery({
    queryKey: ['versions', projectId],
    queryFn: async () => {
      try {
        const res = await api.get(`/projects/${projectId}/versions`)
        return res.data as VersionEntry[]
      } catch {
        return MOCK_VERSIONS
      }
    },
  })

  const handleRestore = async (version: VersionEntry) => {
    if (!confirm(`Restore to ${version.label}? Current changes will be saved as a new version.`)) return
    setRestoring(true)
    try {
      await api.post(`/projects/${projectId}/versions/${version.id}/restore`)
      navigate(`/workspace/${projectId}`)
    } catch {
      // In demo: just navigate
      navigate(`/workspace/${projectId}`)
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border)]/50 bg-[var(--bg-card)]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/workspace/${projectId}`)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight">Version History</h1>
            <p className="font-body text-xs text-[var(--text-muted)]">Track and restore previous states of your canvas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold tracking-wide border transition-all flex items-center gap-2 ${
              compareMode
                ? 'border-[var(--purple)] bg-[var(--purple)]/10 text-[var(--purple)] shadow-[0_0_15px_rgba(123,97,255,0.2)]'
                : 'border-[var(--border)]/50 bg-[var(--bg-input)] text-[var(--text-secondary)] hover:border-[var(--purple)]/30 hover:text-[var(--text-primary)]'
            }`}
          >
            <span>◫</span> Compare Mode
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full p-6 md:p-8 gap-8">
        {/* Version list */}
        <aside className="w-80 shrink-0 bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border)]/50 rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <div className="p-5 border-b border-[var(--border)]/50 bg-gradient-to-b from-[var(--bg-card)] to-transparent">
            <p className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-secondary)]">
              {versions.length} versions
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-[var(--bg-input)] animate-pulse border border-[var(--border)]/30" />
              ))
            ) : (
              versions.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => {
                    if (compareMode) {
                      if (!compareA) setCompareA(v.id)
                      else if (!compareB && v.id !== compareA) setCompareB(v.id)
                      else { setCompareA(v.id); setCompareB(null) }
                    } else {
                      setSelectedVersion(v)
                    }
                  }}
                  className={`w-full text-left p-4 rounded-2xl transition-all border group relative overflow-hidden ${
                    selectedVersion?.id === v.id && !compareMode
                      ? 'border-[var(--purple)] bg-[var(--purple)]/10 shadow-[0_0_15px_rgba(123,97,255,0.1)]'
                      : compareA === v.id || compareB === v.id
                      ? 'border-[var(--cyan)] bg-[var(--cyan)]/10 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                      : 'border-[var(--border)]/30 bg-[var(--bg-input)] hover:border-[var(--purple)]/30 hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {selectedVersion?.id === v.id && !compareMode && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--purple)]/5 to-transparent pointer-events-none" />
                  )}
                  <div className="relative flex items-center gap-3 mb-2">
                    {v.isCheckpoint && (
                      <div className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0 shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
                    )}
                    <span className={`font-display font-bold text-sm truncate ${v.isCheckpoint ? 'text-[var(--gold)]' : 'text-[var(--text-primary)]'}`}>
                      {v.label}
                    </span>
                    {i === 0 && (
                      <span className="ml-auto font-mono font-bold tracking-widest uppercase text-[9px] px-2 py-1 rounded-md bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30 shrink-0">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center justify-between font-body text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]/50" /> {v.nodeCount} nodes
                    </span>
                    <span>{formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}</span>
                  </div>
                  <p className="relative font-body text-[10px] text-[var(--text-muted)] mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity">by {v.createdBy}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Detail panel */}
        <main className="flex-1 bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border)]/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col">
          {compareMode && compareA && compareB ? (
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-xl bg-[var(--cyan)]/10 flex items-center justify-center border border-[var(--cyan)]/20">
                  <span className="text-[var(--cyan)]">◫</span>
                </div>
                <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
                  Comparing Versions
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-8">
                {[compareA, compareB].map((id, i) => {
                  const v = versions.find(v => v.id === id)
                  if (!v) return null
                  return (
                    <div key={id} className="bg-[var(--bg-input)] rounded-2xl border border-[var(--cyan)]/30 p-6 relative overflow-hidden group hover:border-[var(--cyan)]/50 transition-colors">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--cyan)]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                      <p className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--cyan)] mb-3 bg-[var(--cyan)]/10 w-fit px-2.5 py-1 rounded-md border border-[var(--cyan)]/20">{i === 0 ? 'Version A' : 'Version B'}</p>
                      <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-1">{v.label}</h3>
                      <p className="font-body text-xs text-[var(--text-muted)] mb-6">{format(new Date(v.createdAt), 'MMM d, yyyy HH:mm')}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]/50 shadow-sm">
                          <p className="text-2xl font-display font-bold text-[var(--text-primary)] mb-1">{v.nodeCount}</p>
                          <p className="font-display font-bold tracking-widest uppercase text-[9px] text-[var(--text-muted)]">Nodes</p>
                        </div>
                        <div className="text-center p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]/50 shadow-sm">
                          <p className="text-2xl font-display font-bold text-[var(--text-primary)] mb-1">{v.edgeCount}</p>
                          <p className="font-display font-bold tracking-widest uppercase text-[9px] text-[var(--text-muted)]">Edges</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : selectedVersion ? (
            <motion.div
              key={selectedVersion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, type: 'spring', bounce: 0.2 }}
              className="p-8 overflow-y-auto custom-scrollbar flex-1 flex flex-col"
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {selectedVersion.isCheckpoint && (
                      <span className="font-display font-bold tracking-widest uppercase text-[9px] px-2.5 py-1 rounded-md bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 shadow-[0_0_10px_rgba(255,215,0,0.1)]">
                        Checkpoint
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">
                    {selectedVersion.label}
                  </h2>
                  {selectedVersion.description && (
                    <p className="font-body text-sm text-[var(--text-muted)] max-w-md leading-relaxed">{selectedVersion.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRestore(selectedVersion)}
                  disabled={restoring}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] text-white font-display font-bold text-sm shadow-[0_0_20px_rgba(123,97,255,0.3)] hover:shadow-[0_0_30px_rgba(123,97,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {restoring ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Restoring...</>
                  ) : (
                    <><span>↺</span> Restore Version</>
                  )}
                </button>
              </div>

              {/* Thumbnail placeholder */}
              <div className="h-72 rounded-3xl bg-[var(--bg-input)] border border-[var(--border)]/50 mb-8 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-muted) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]/50 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <span className="text-2xl opacity-50">🗺️</span>
                </div>
                <p className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-muted)]">Canvas Preview</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Nodes', value: selectedVersion.nodeCount, icon: '⬚' },
                  { label: 'Connections', value: selectedVersion.edgeCount, icon: '→' },
                  { label: 'Author', value: selectedVersion.createdBy, icon: '👤' },
                ].map(s => (
                  <div key={s.label} className="bg-[var(--bg-input)] rounded-2xl border border-[var(--border)]/50 p-5 flex items-center gap-4 hover:border-[var(--purple)]/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]/50 flex items-center justify-center text-[var(--text-muted)]">
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-xl font-display font-bold text-[var(--text-primary)]">{s.value}</p>
                      <p className="font-display font-bold tracking-widest uppercase text-[9px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-[var(--border)]/30 flex items-center gap-2 text-[var(--text-muted)]">
                <span className="text-sm">🕒</span>
                <p className="font-body text-xs">
                  Saved on <span className="text-[var(--text-secondary)] font-medium">{format(new Date(selectedVersion.createdAt), "MMMM d, yyyy 'at' HH:mm")}</span>
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-input)] border border-[var(--border)]/50 flex items-center justify-center mb-6 shadow-sm relative">
                <div className="absolute inset-0 rounded-full border border-[var(--purple)]/20 animate-ping opacity-20" />
                <span className="text-4xl opacity-50">⏳</span>
              </div>
              <h3 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">Select a Version</h3>
              <p className="font-body text-sm text-[var(--text-muted)] max-w-xs">Choose a version from the timeline to preview its contents and restore if needed.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
