import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'

interface User {
  id: string
  email: string
  displayName: string
  role: 'user' | 'admin' | 'moderator'
  plan: 'free' | 'pro' | 'team' | 'enterprise'
  status: 'active' | 'suspended' | 'pending'
  projectCount: number
  joinedAt: string
  lastActiveAt: string
  storageUsed: string
}

const MOCK_USERS: User[] = [
  { id: '1', email: 'alice@example.com', displayName: 'Alice Chen', role: 'user', plan: 'pro', status: 'active', projectCount: 24, joinedAt: '2024-11-01T00:00:00Z', lastActiveAt: new Date(Date.now() - 3600000).toISOString(), storageUsed: '2.1 GB' },
  { id: '2', email: 'bob@example.com', displayName: 'Bob Martinez', role: 'user', plan: 'free', status: 'active', projectCount: 7, joinedAt: '2024-12-15T00:00:00Z', lastActiveAt: new Date(Date.now() - 86400000).toISOString(), storageUsed: '340 MB' },
  { id: '3', email: 'carol@example.com', displayName: 'Carol Lee', role: 'moderator', plan: 'pro', status: 'active', projectCount: 31, joinedAt: '2024-10-20T00:00:00Z', lastActiveAt: new Date(Date.now() - 7200000).toISOString(), storageUsed: '5.8 GB' },
  { id: '4', email: 'dave@example.com', displayName: 'Dave Kim', role: 'user', plan: 'team', status: 'suspended', projectCount: 12, joinedAt: '2024-09-05T00:00:00Z', lastActiveAt: new Date(Date.now() - 604800000).toISOString(), storageUsed: '1.2 GB' },
  { id: '5', email: 'eve@example.com', displayName: 'Eve Johnson', role: 'user', plan: 'enterprise', status: 'active', projectCount: 89, joinedAt: '2024-08-01T00:00:00Z', lastActiveAt: new Date(Date.now() - 1800000).toISOString(), storageUsed: '18.4 GB' },
  { id: '6', email: 'frank@example.com', displayName: 'Frank Wilson', role: 'user', plan: 'free', status: 'pending', projectCount: 1, joinedAt: '2025-01-20T00:00:00Z', lastActiveAt: new Date(Date.now() - 172800000).toISOString(), storageUsed: '45 MB' },
]

const ROLE_COLORS: Record<User['role'], string> = {
  user: 'text-[var(--text-muted)]',
  admin: 'text-[var(--error)]',
  moderator: 'text-[var(--cyan)]',
}

const PLAN_COLORS: Record<User['plan'], string> = {
  free: 'bg-[var(--bg-surface)] text-[var(--text-muted)]',
  pro: 'bg-[var(--purple)]/20 text-[var(--purple)]',
  team: 'bg-[var(--cyan)]/20 text-[var(--cyan)]',
  enterprise: 'bg-[var(--gold)]/20 text-[var(--gold)]',
}

const STATUS_COLORS: Record<User['status'], string> = {
  active: 'text-[var(--success)]',
  suspended: 'text-[var(--error)]',
  pending: 'text-[var(--gold)]',
}

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<User['role'] | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<User['status'] | 'all'>('all')
  const [sortBy, setSortBy] = useState<'joined' | 'active' | 'projects'>('joined')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'suspend' | 'delete'; userId: string } | null>(null)
  const queryClient = useQueryClient()

  const { data: users = MOCK_USERS } = useQuery({
    queryKey: ['admin', 'users', search, filterRole, filterStatus, sortBy],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/users', { params: { search, role: filterRole, status: filterStatus, sort: sortBy } })
        return res.data as User[]
      } catch {
        return MOCK_USERS
      }
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: User['role'] }) => {
      try { await api.patch(`/admin/users/${id}`, { role }) } catch { /* offline */ }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const suspendMutation = useMutation({
    mutationFn: async (id: string) => {
      try { await api.patch(`/admin/users/${id}`, { status: 'suspended' }) } catch { /* offline */ }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); setConfirmAction(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try { await api.delete(`/admin/users/${id}`) } catch { /* offline */ }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); setConfirmAction(null); setSelectedUser(null) },
  })

  const filtered = users
    .filter(u =>
      (filterRole === 'all' || u.role === filterRole) &&
      (filterStatus === 'all' || u.status === filterStatus) &&
      (u.email.includes(search.toLowerCase()) || u.displayName.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'joined') return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
      if (sortBy === 'active') return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
      return b.projectCount - a.projectCount
    })

  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const formatRelative = (s: string) => {
    const diff = Date.now() - new Date(s).getTime()
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`
    return `${Math.round(diff / 86400000)}d ago`
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Users</h1>
          <p className="text-[var(--text-secondary)] mt-2 text-lg">{users.length} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <div className="relative flex-1 min-w-[250px]">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" width="16" height="16" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-11 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] transition-all"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value as typeof filterRole)}
          className="px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] transition-all appearance-none min-w-[140px]"
        >
          <option value="all" className="bg-[var(--bg-page)]">All roles</option>
          <option value="user" className="bg-[var(--bg-page)]">User</option>
          <option value="moderator" className="bg-[var(--bg-page)]">Moderator</option>
          <option value="admin" className="bg-[var(--bg-page)]">Admin</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] transition-all appearance-none min-w-[140px]"
        >
          <option value="all" className="bg-[var(--bg-page)]">All statuses</option>
          <option value="active" className="bg-[var(--bg-page)]">Active</option>
          <option value="suspended" className="bg-[var(--bg-page)]">Suspended</option>
          <option value="pending" className="bg-[var(--bg-page)]">Pending</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] transition-all appearance-none min-w-[160px]"
        >
          <option value="joined" className="bg-[var(--bg-page)]">Sort: Joined</option>
          <option value="active" className="bg-[var(--bg-page)]">Sort: Last active</option>
          <option value="projects" className="bg-[var(--bg-page)]">Sort: Projects</option>
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Users table */}
        <div className="md:col-span-2 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--purple)] via-[var(--cyan)] to-transparent opacity-50" />
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">User</th>
                <th className="text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Plan</th>
                <th className="text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Last active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(user => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`cursor-pointer transition-all duration-300 group ${
                    selectedUser?.id === user.id ? 'bg-[var(--purple)]/10 shadow-[inset_4px_0_0_var(--purple)]' : 'hover:bg-white/5'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md group-hover:scale-105 transition-transform"
                        style={{ background: 'var(--gradient-brand)' }}
                      >
                        {user.displayName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{user.displayName}</p>
                        <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-lg font-bold border border-current/20 uppercase tracking-wider ${PLAN_COLORS[user.plan]}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold capitalize ${STATUS_COLORS[user.status]}`}>{user.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">{formatRelative(user.lastActiveAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User detail */}
        <div>
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div
                key={selectedUser.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] sticky top-8 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--purple)] to-transparent opacity-50" />
                <div className="flex items-center gap-4 mb-8">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-xl text-white shadow-lg"
                    style={{ background: 'var(--gradient-brand)' }}
                  >
                    {selectedUser.displayName[0]}
                  </div>
                  <div>
                    <p className="font-display font-bold text-xl text-white drop-shadow-sm">{selectedUser.displayName}</p>
                    <p className="text-sm font-medium text-[var(--text-muted)]">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8 bg-black/20 p-6 rounded-2xl border border-white/5">
                  {[
                    { label: 'Role', value: <span className={`text-sm font-bold capitalize ${ROLE_COLORS[selectedUser.role]}`}>{selectedUser.role}</span> },
                    { label: 'Plan', value: <span className={`text-xs px-3 py-1 rounded-lg font-bold border border-current/20 uppercase tracking-wider ${PLAN_COLORS[selectedUser.plan]}`}>{selectedUser.plan}</span> },
                    { label: 'Status', value: <span className={`text-sm font-bold capitalize ${STATUS_COLORS[selectedUser.status]}`}>{selectedUser.status}</span> },
                    { label: 'Projects', value: <span className="text-sm font-mono font-bold text-white/90">{selectedUser.projectCount}</span> },
                    { label: 'Storage', value: <span className="text-sm font-mono font-bold text-white/90">{selectedUser.storageUsed}</span> },
                    { label: 'Joined', value: <span className="text-sm font-medium text-[var(--text-secondary)]">{formatDate(selectedUser.joinedAt)}</span> },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{row.label}</span>
                      {row.value}
                    </div>
                  ))}
                </div>

                <div className="mb-8">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Change role</p>
                  <select
                    value={selectedUser.role}
                    onChange={e => updateRoleMutation.mutate({ id: selectedUser.id, role: e.target.value as User['role'] })}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[var(--purple)] focus:ring-1 focus:ring-[var(--purple)] transition-all appearance-none"
                  >
                    <option value="user" className="bg-[var(--bg-page)]">User</option>
                    <option value="moderator" className="bg-[var(--bg-page)]">Moderator</option>
                    <option value="admin" className="bg-[var(--bg-page)]">Admin</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3">
                  {selectedUser.status !== 'suspended' && (
                    <button
                      onClick={() => setConfirmAction({ type: 'suspend', userId: selectedUser.id })}
                      className="py-3 rounded-xl text-sm font-bold border border-[var(--gold)]/30 text-[var(--gold)] hover:bg-[var(--gold)]/10 hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all duration-300"
                    >
                      Suspend account
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmAction({ type: 'delete', userId: selectedUser.id })}
                    className="py-3 rounded-xl text-sm font-bold border border-[var(--error)]/30 text-[var(--error)] hover:bg-[var(--error)]/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all duration-300"
                  >
                    Delete account
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-64 flex items-center justify-center bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 border-dashed shadow-inner sticky top-8"
              >
                <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Select a user</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[var(--bg-page)] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 opacity-50 ${confirmAction.type === 'delete' ? 'bg-gradient-to-r from-[var(--error)] to-transparent' : 'bg-gradient-to-r from-[var(--gold)] to-transparent'}`} />
              <h3 className="font-display font-bold text-2xl text-white mb-3">
                {confirmAction.type === 'suspend' ? 'Suspend account?' : 'Delete account?'}
              </h3>
              <p className="text-base text-[var(--text-secondary)] mb-8 leading-relaxed">
                {confirmAction.type === 'suspend'
                  ? 'The user will lose access immediately. You can unsuspend later.'
                  : 'This will permanently delete all user data including projects. This cannot be undone.'}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    confirmAction.type === 'suspend'
                      ? suspendMutation.mutate(confirmAction.userId)
                      : deleteMutation.mutate(confirmAction.userId)
                  }
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    confirmAction.type === 'delete'
                      ? 'bg-[var(--error)] text-white hover:bg-[var(--error)]/90 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'bg-[var(--gold)]/20 text-[var(--gold)] hover:bg-[var(--gold)]/30 border border-[var(--gold)]/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                  }`}
                >
                  {confirmAction.type === 'suspend' ? 'Suspend' : 'Delete'}
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold border border-white/10 text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
