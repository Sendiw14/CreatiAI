import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import api from '../../lib/api'

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string
  enabled: boolean
  rollout: number
  environment: 'production' | 'staging' | 'development' | 'all'
  createdAt: string
  updatedAt: string
  tags: string[]
}

const MOCK_FLAGS: FeatureFlag[] = [
  { id: '1', key: 'ai_streaming_v2', name: 'AI Streaming v2', description: 'New streaming architecture with lower latency', enabled: true, rollout: 100, environment: 'all', createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z', tags: ['ai', 'performance'] },
  { id: '2', key: 'canvas_collaborative_v3', name: 'Canvas Collab v3', description: 'Improved CRDT-based collaborative canvas', enabled: true, rollout: 50, environment: 'production', createdAt: '2025-01-12T00:00:00Z', updatedAt: '2025-01-18T00:00:00Z', tags: ['canvas', 'collab'] },
  { id: '3', key: 'voice_input_beta', name: 'Voice Input (Beta)', description: 'Voice-to-prompt input mode in AI panel', enabled: false, rollout: 10, environment: 'staging', createdAt: '2025-01-14T00:00:00Z', updatedAt: '2025-01-14T00:00:00Z', tags: ['ai', 'input', 'beta'] },
  { id: '4', key: 'export_svg_advanced', name: 'Advanced SVG Export', description: 'High-fidelity SVG with embedded fonts', enabled: true, rollout: 75, environment: 'production', createdAt: '2025-01-08T00:00:00Z', updatedAt: '2025-01-20T00:00:00Z', tags: ['export'] },
  { id: '5', key: 'ai_what_if_v2', name: 'What-If Mode v2', description: 'Branching with full state isolation', enabled: false, rollout: 0, environment: 'development', createdAt: '2025-01-16T00:00:00Z', updatedAt: '2025-01-16T00:00:00Z', tags: ['ai', 'experimental'] },
  { id: '6', key: 'usage_analytics_v2', name: 'Usage Analytics v2', description: 'Per-user detailed analytics dashboard', enabled: true, rollout: 30, environment: 'staging', createdAt: '2025-01-11T00:00:00Z', updatedAt: '2025-01-19T00:00:00Z', tags: ['analytics'] },
]

const ENV_COLORS: Record<FeatureFlag['environment'], string> = {
  production: 'bg-[var(--success)]/20 text-[var(--success)]',
  staging: 'bg-[var(--gold)]/20 text-[var(--gold)]',
  development: 'bg-[var(--cyan)]/20 text-[var(--cyan)]',
  all: 'bg-[var(--purple)]/20 text-[var(--purple)]',
}

export default function AdminFlags() {
  const [creatingNew, setCreatingNew] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newFlag, setNewFlag] = useState<Partial<FeatureFlag>>({
    key: '',
    name: '',
    description: '',
    enabled: false,
    rollout: 0,
    environment: 'development',
    tags: [],
  })
  const queryClient = useQueryClient()

  const { data: flags = MOCK_FLAGS } = useQuery({
    queryKey: ['admin', 'flags'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/flags')
        return res.data as FeatureFlag[]
      } catch {
        return MOCK_FLAGS
      }
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      try {
        await api.patch(`/admin/flags/${id}`, { enabled })
      } catch { /* offline */ }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'flags'] }),
  })

  const updateRolloutMutation = useMutation({
    mutationFn: async ({ id, rollout }: { id: string; rollout: number }) => {
      try {
        await api.patch(`/admin/flags/${id}`, { rollout })
      } catch { /* offline */ }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'flags'] }),
  })

  const createMutation = useMutation({
    mutationFn: async (flag: Partial<FeatureFlag>) => {
      try {
        await api.post('/admin/flags', flag)
      } catch { /* offline */ }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flags'] })
      setCreatingNew(false)
      setNewFlag({ key: '', name: '', description: '', enabled: false, rollout: 0, environment: 'development', tags: [] })
    },
  })

  const filteredFlags = flags.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.tags.some(t => t.includes(searchQuery.toLowerCase()))
  )

  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Feature Flags</h1>
          <p className="text-[var(--text-secondary)] mt-2 text-lg">{flags.filter(f => f.enabled).length} of {flags.length} flags enabled</p>
        </div>
        <button
          onClick={() => setCreatingNew(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New flag
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" width="16" height="16" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search flags..."
          className="w-full pl-11 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] transition-all shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        />
      </div>

      {/* Create new flag form */}
      <AnimatePresence>
        {creatingNew && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-[var(--purple)]/50 p-8 shadow-[0_20px_50px_rgba(168,85,247,0.15)] relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--purple)] to-transparent opacity-50" />
              <h3 className="font-display font-bold text-xl text-white mb-6">New feature flag</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Flag key</label>
                  <input
                    value={newFlag.key}
                    onChange={e => setNewFlag(p => ({ ...p, key: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                    placeholder="feature_key_name"
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm font-mono text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)] focus:ring-1 focus:ring-[var(--purple)] transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Display name</label>
                  <input
                    value={newFlag.name}
                    onChange={e => setNewFlag(p => ({ ...p, name: e.target.value }))}
                    placeholder="Feature Name"
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)] focus:ring-1 focus:ring-[var(--purple)] transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Description</label>
                  <input
                    value={newFlag.description}
                    onChange={e => setNewFlag(p => ({ ...p, description: e.target.value }))}
                    placeholder="What does this flag control?"
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)] focus:ring-1 focus:ring-[var(--purple)] transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Environment</label>
                  <select
                    value={newFlag.environment}
                    onChange={e => setNewFlag(p => ({ ...p, environment: e.target.value as FeatureFlag['environment'] }))}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[var(--purple)] focus:ring-1 focus:ring-[var(--purple)] transition-all appearance-none"
                  >
                    <option value="development" className="bg-[var(--bg-page)]">Development</option>
                    <option value="staging" className="bg-[var(--bg-page)]">Staging</option>
                    <option value="production" className="bg-[var(--bg-page)]">Production</option>
                    <option value="all" className="bg-[var(--bg-page)]">All</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Rollout % ({newFlag.rollout}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newFlag.rollout}
                    onChange={e => setNewFlag(p => ({ ...p, rollout: Number(e.target.value) }))}
                    className="w-full mt-3 accent-[var(--purple)]"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => createMutation.mutate({ ...newFlag, id: nanoid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: newFlag.tags ?? [] })}
                  disabled={!newFlag.key || !newFlag.name}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  style={{ background: 'var(--gradient-brand)' }}
                >
                  Create flag
                </button>
                <button
                  onClick={() => setCreatingNew(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flags table */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--purple)] via-[var(--cyan)] to-transparent opacity-50" />
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-black/20">
              <th className="text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Flag</th>
              <th className="text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Environment</th>
              <th className="text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Rollout</th>
              <th className="text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Updated</th>
              <th className="text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredFlags.map(flag => (
              <tr key={flag.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{flag.name}</p>
                  <p className="text-xs font-mono text-[var(--text-muted)] mt-1">{flag.key}</p>
                  <div className="flex gap-2 mt-2">
                    {flag.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-lg bg-black/20 border border-white/10 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-3 py-1 rounded-lg font-bold border border-current/20 ${ENV_COLORS[flag.environment]}`}>
                    {flag.environment}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full relative overflow-hidden"
                        style={{ width: `${flag.rollout}%`, background: 'var(--gradient-brand)' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[var(--text-muted)] font-mono">{flag.rollout}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue={flag.rollout}
                    onMouseUp={e => updateRolloutMutation.mutate({ id: flag.id, rollout: Number((e.target as HTMLInputElement).value) })}
                    className="w-24 mt-2 accent-[var(--purple)]"
                  />
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">{formatDate(flag.updatedAt)}</p>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleMutation.mutate({ id: flag.id, enabled: !flag.enabled })}
                    className={`relative w-12 rounded-full transition-all duration-300 shrink-0 shadow-inner border border-white/10`}
                    style={{ height: '26px', background: flag.enabled ? 'var(--purple)' : 'rgba(0,0,0,0.4)' }}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-md ${
                        flag.enabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
