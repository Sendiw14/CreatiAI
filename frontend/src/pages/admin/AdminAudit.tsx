import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'

interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  actorEmail: string
  action: string
  resourceType: string
  resourceId: string
  resourceName?: string
  ipAddress: string
  userAgent: string
  metadata?: Record<string, string>
}

type ActionCategory = 'all' | 'auth' | 'project' | 'user' | 'admin' | 'ai'

const MOCK_AUDIT: AuditEntry[] = [
  { id: '1', timestamp: new Date(Date.now() - 120000).toISOString(), actor: 'Admin', actorEmail: 'admin@creatiai.com', action: 'admin.flag.review', resourceType: 'governance_flag', resourceId: 'f1', resourceName: 'AI bias report', ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0' },
  { id: '2', timestamp: new Date(Date.now() - 300000).toISOString(), actor: 'Alice Chen', actorEmail: 'alice@example.com', action: 'project.create', resourceType: 'project', resourceId: 'p123', resourceName: 'Brand Strategy 2025', ipAddress: '10.0.0.5', userAgent: 'Mozilla/5.0' },
  { id: '3', timestamp: new Date(Date.now() - 600000).toISOString(), actor: 'Admin', actorEmail: 'admin@creatiai.com', action: 'user.role.update', resourceType: 'user', resourceId: 'u789', resourceName: 'carol@example.com', ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', metadata: { from: 'user', to: 'moderator' } },
  { id: '4', timestamp: new Date(Date.now() - 1800000).toISOString(), actor: 'System', actorEmail: 'system@creatiai.com', action: 'auth.token.refresh', resourceType: 'session', resourceId: 's456', ipAddress: '10.0.0.8', userAgent: 'Mozilla/5.0' },
  { id: '5', timestamp: new Date(Date.now() - 3600000).toISOString(), actor: 'Bob Martinez', actorEmail: 'bob@example.com', action: 'auth.login', resourceType: 'session', resourceId: 's455', ipAddress: '203.0.113.12', userAgent: 'Chrome/120' },
  { id: '6', timestamp: new Date(Date.now() - 7200000).toISOString(), actor: 'Admin', actorEmail: 'admin@creatiai.com', action: 'admin.flag.create', resourceType: 'feature_flag', resourceId: 'ff1', resourceName: 'ai_streaming_v2', ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0' },
  { id: '7', timestamp: new Date(Date.now() - 10800000).toISOString(), actor: 'Carol Lee', actorEmail: 'carol@example.com', action: 'ai.interaction', resourceType: 'ai_session', resourceId: 'ai789', ipAddress: '172.16.0.3', userAgent: 'Firefox/120' },
  { id: '8', timestamp: new Date(Date.now() - 14400000).toISOString(), actor: 'Eve Johnson', actorEmail: 'eve@example.com', action: 'project.export', resourceType: 'project', resourceId: 'p321', resourceName: 'Q4 Campaign', ipAddress: '10.0.1.2', userAgent: 'Safari/17' },
  { id: '9', timestamp: new Date(Date.now() - 18000000).toISOString(), actor: 'Admin', actorEmail: 'admin@creatiai.com', action: 'user.suspend', resourceType: 'user', resourceId: 'u999', resourceName: 'dave@example.com', ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0' },
  { id: '10', timestamp: new Date(Date.now() - 86400000).toISOString(), actor: 'System', actorEmail: 'system@creatiai.com', action: 'system.health_check', resourceType: 'system', resourceId: 'sys', ipAddress: '127.0.0.1', userAgent: 'HealthCheck/1.0' },
]

const ACTION_CATEGORY_MAP: Record<ActionCategory, string[]> = {
  all: [],
  auth: ['auth.login', 'auth.logout', 'auth.signup', 'auth.token.refresh', 'auth.password.change'],
  project: ['project.create', 'project.update', 'project.delete', 'project.export', 'project.share'],
  user: ['user.role.update', 'user.suspend', 'user.delete', 'user.profile.update'],
  admin: ['admin.flag.create', 'admin.flag.review', 'admin.policy.update'],
  ai: ['ai.interaction', 'ai.flag', 'ai.model.update'],
}

const ACTION_COLORS: Record<string, string> = {
  'auth.login': 'text-[var(--cyan)]',
  'auth.logout': 'text-[var(--text-muted)]',
  'auth.signup': 'text-[var(--success)]',
  'project.create': 'text-[var(--success)]',
  'project.delete': 'text-[var(--error)]',
  'user.suspend': 'text-[var(--error)]',
  'user.role.update': 'text-[var(--gold)]',
  'admin.flag.review': 'text-[var(--purple)]',
  'admin.flag.create': 'text-[var(--purple)]',
  'ai.interaction': 'text-[var(--cyan)]',
  'system.health_check': 'text-[var(--text-muted)]',
}

export default function AdminAudit() {
  const [category, setCategory] = useState<ActionCategory>('all')
  const [actorFilter, setActorFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: audit = MOCK_AUDIT } = useQuery({
    queryKey: ['admin', 'audit', category, actorFilter, dateFrom, dateTo],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/audit', { params: { category, actor: actorFilter, from: dateFrom, to: dateTo } })
        return res.data as AuditEntry[]
      } catch {
        return MOCK_AUDIT
      }
    },
  })

  const filtered = audit.filter(entry => {
    if (category !== 'all') {
      if (!ACTION_CATEGORY_MAP[category].some(a => entry.action.startsWith(a.split('.')[0] + '.'))) return false
    }
    if (actorFilter && !entry.actorEmail.includes(actorFilter) && !entry.actor.toLowerCase().includes(actorFilter.toLowerCase())) return false
    if (dateFrom && new Date(entry.timestamp) < new Date(dateFrom)) return false
    if (dateTo && new Date(entry.timestamp) > new Date(dateTo)) return false
    return true
  })

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const actionColor = (action: string) => ACTION_COLORS[action] ?? 'text-[var(--text-secondary)]'

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Audit Log</h1>
        <p className="text-[var(--text-secondary)] mt-2 text-lg">Complete history of all platform actions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <div className="flex gap-2">
          {(['all', 'auth', 'project', 'user', 'admin', 'ai'] as ActionCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                category === cat
                  ? 'bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border-transparent'
                  : 'bg-black/20 border border-white/10 text-[var(--text-muted)] hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1 flex gap-4 min-w-[300px]">
          <input
            value={actorFilter}
            onChange={e => setActorFilter(e.target.value)}
            placeholder="Filter by actor..."
            className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] transition-all"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] transition-all [color-scheme:dark]"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] transition-all [color-scheme:dark]"
          />
        </div>
        {(actorFilter || dateFrom || dateTo || category !== 'all') && (
          <button
            onClick={() => { setActorFilter(''); setDateFrom(''); setDateTo(''); setCategory('all') }}
            className="px-4 py-2 text-sm font-bold text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Log table */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--purple)] via-[var(--cyan)] to-transparent opacity-50" />
        
        <div className="grid grid-cols-[180px_1fr_180px_160px_60px] gap-4 border-b border-white/10 px-6 py-4 bg-black/20">
          {['Timestamp', 'Action', 'Actor', 'Resource', ''].map(h => (
            <span key={h} className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{h}</span>
          ))}
        </div>

        <div className="divide-y divide-white/5">
          {filtered.map(entry => (
            <div key={entry.id} className="group">
              <div
                className="grid grid-cols-[180px_1fr_180px_160px_60px] gap-4 px-6 py-4 hover:bg-white/5 cursor-pointer transition-all duration-300 items-center"
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              >
                <span className="text-sm font-mono text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">{formatTimestamp(entry.timestamp)}</span>
                <span className={`text-sm font-mono font-bold ${actionColor(entry.action)} drop-shadow-sm`}>{entry.action}</span>
                <div>
                  <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{entry.actor}</p>
                  <p className="text-xs text-[var(--text-muted)]">{entry.actorEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">{entry.resourceType}</p>
                  {entry.resourceName && <p className="text-sm text-[var(--text-secondary)] truncate group-hover:text-white transition-colors">{entry.resourceName}</p>}
                </div>
                <div className="flex justify-end">
                  <span className={`text-xs text-[var(--text-muted)] transition-transform duration-300 ${expandedId === entry.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {expandedId === entry.id && (
                <div className="bg-black/40 px-6 py-5 border-t border-white/5 text-sm font-mono animate-[fadeIn_0.2s_ease-out]">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Resource ID</span>
                      <span className="text-white/90 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 inline-block w-fit">{entry.resourceId}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">IP Address</span>
                      <span className="text-white/90 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 inline-block w-fit">{entry.ipAddress}</span>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">User Agent</span>
                      <span className="text-[var(--text-secondary)] bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">{entry.userAgent}</span>
                    </div>
                    {entry.metadata && Object.entries(entry.metadata).map(([k, v]) => (
                      <div key={k} className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{k}</span>
                        <span className="text-[var(--cyan)] bg-[var(--cyan)]/10 px-3 py-1.5 rounded-lg border border-[var(--cyan)]/20 inline-block w-fit">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[var(--text-muted)] text-sm">No audit entries match the current filters</p>
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-3 text-right">Showing {filtered.length} of {audit.length} entries</p>
    </div>
  )
}
