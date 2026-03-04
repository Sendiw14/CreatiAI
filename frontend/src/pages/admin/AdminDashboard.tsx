import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  aiInteractions: number
  storageUsed: string
  revenueMonth: number
  newUsersWeek: number
  retentionRate: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
  userId?: string
}

const MOCK_STATS: AdminStats = {
  totalUsers: 1247,
  activeUsers: 342,
  totalProjects: 4891,
  aiInteractions: 28473,
  storageUsed: '128 GB',
  revenueMonth: 18450,
  newUsersWeek: 87,
  retentionRate: 0.73,
}

const MOCK_ACTIVITY: RecentActivity[] = [
  { id: '1', type: 'user_signup', description: 'New user signed up: alex@example.com', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: '2', type: 'project_create', description: 'Project created: "Brand Strategy 2025"', timestamp: new Date(Date.now() - 900000).toISOString() },
  { id: '3', type: 'ai_flag', description: 'AI response flagged for review', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: '4', type: 'user_upgrade', description: 'User upgraded to Pro: sam@example.com', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '5', type: 'system', description: 'System health check: all services nominal', timestamp: new Date(Date.now() - 7200000).toISOString() },
]

export default function AdminDashboard() {
  const navigate = useNavigate()

  const { data: stats = MOCK_STATS } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/stats')
        return res.data as AdminStats
      } catch {
        return MOCK_STATS
      }
    },
  })

  const { data: activity = MOCK_ACTIVITY } = useQuery({
    queryKey: ['admin', 'activity'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/activity')
        return res.data as RecentActivity[]
      } catch {
        return MOCK_ACTIVITY
      }
    },
  })

  const statCards = [
    { label: 'Total users', value: stats.totalUsers.toLocaleString(), change: `+${stats.newUsersWeek} this week`, up: true, color: 'var(--purple)' },
    { label: 'Active users', value: stats.activeUsers.toLocaleString(), change: `${Math.round(stats.activeUsers / stats.totalUsers * 100)}% of total`, up: true, color: 'var(--cyan)' },
    { label: 'AI interactions', value: stats.aiInteractions.toLocaleString(), change: 'All time', up: true, color: 'var(--gold)' },
    { label: 'MRR', value: `$${stats.revenueMonth.toLocaleString()}`, change: '+12% vs last month', up: true, color: 'var(--success)' },
    { label: 'Projects', value: stats.totalProjects.toLocaleString(), change: 'All time', up: true, color: 'var(--purple)' },
    { label: 'Retention rate', value: `${Math.round(stats.retentionRate * 100)}%`, change: '30-day', up: stats.retentionRate > 0.6, color: stats.retentionRate > 0.6 ? 'var(--success)' : 'var(--error)' },
    { label: 'Storage used', value: stats.storageUsed, change: 'Across all users', up: null, color: 'var(--text-muted)' },
  ]

  const activityIcon = (type: string) => {
    const icons: Record<string, string> = {
      user_signup: '👤',
      project_create: '📋',
      ai_flag: '⚠️',
      user_upgrade: '⭐',
      system: '🔧',
    }
    return icons[type] ?? '•'
  }

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime()
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`
    return `${Math.round(diff / 86400000)}d ago`
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-base text-[var(--text-secondary)] mt-2">Platform overview and key metrics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {statCards.slice(0, 4).map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:bg-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Subtle glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" style={{ backgroundColor: card.color }} />
            
            <p className="text-xs font-mono font-bold text-[var(--text-muted)] mb-3 uppercase tracking-widest">{card.label}</p>
            <p className="text-3xl font-display font-bold tracking-tight" style={{ color: card.color }}>{card.value}</p>
            <div className="mt-3 flex items-center gap-2">
              {card.up !== null && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${card.up ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {card.up ? '↑' : '↓'}
                </span>
              )}
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                {card.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {statCards.slice(4).map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 4) * 0.1, type: 'spring', stiffness: 100 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:bg-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Subtle glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" style={{ backgroundColor: card.color }} />
            
            <p className="text-xs font-mono font-bold text-[var(--text-muted)] mb-3 uppercase tracking-widest">{card.label}</p>
            <p className="text-3xl font-display font-bold tracking-tight" style={{ color: card.color }}>{card.value}</p>
            <div className="mt-3 flex items-center gap-2">
              {card.up !== null && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${card.up ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {card.up ? '↑' : '↓'}
                </span>
              )}
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                {card.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent activity */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--purple)] to-transparent opacity-50" />
          <h3 className="font-display font-bold text-xl text-white mb-6">Recent activity</h3>
          <div className="space-y-5">
            {activity.map((item, i) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 shadow-inner">
                  {activityIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium text-white/90 leading-snug group-hover:text-white transition-colors">{item.description}</p>
                  <p className="text-xs font-mono text-[var(--text-muted)] mt-1.5">{formatTime(item.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => navigate('/admin/audit')}
            className="mt-8 text-sm font-bold text-[var(--cyan)] hover:text-white flex items-center gap-2 transition-colors group"
          >
            View full audit log <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </motion.div>

        {/* Quick actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--cyan)] to-transparent opacity-50" />
          <h3 className="font-display font-bold text-xl text-white mb-6">Quick actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'View all users', path: '/admin/users', icon: '👥' },
              { label: 'Analytics report', path: '/admin/analytics', icon: '📊' },
              { label: 'AI governance', path: '/admin/governance', icon: '⚖️' },
              { label: 'Feature flags', path: '/admin/flags', icon: '🚩' },
              { label: 'Audit log', path: '/admin/audit', icon: '📝' },
              { label: 'Billing overview', path: '/admin/billing', icon: '💳' },
            ].map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-start gap-3 p-5 rounded-2xl text-left border border-white/10 bg-black/20 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
                <span className="text-sm font-bold text-white/80 group-hover:text-white">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
