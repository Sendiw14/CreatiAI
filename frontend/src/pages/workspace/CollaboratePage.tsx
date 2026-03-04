import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import toast from 'react-hot-toast'

type Role = 'viewer' | 'editor' | 'admin'
type TabId = 'members' | 'invite' | 'link'

interface Collaborator {
  id: string
  displayName: string
  email: string
  avatarUrl?: string
  role: Role
  joinedAt: string
  online?: boolean
}

const ROLE_LABELS: Record<Role, string> = {
  viewer: 'Can view',
  editor: 'Can edit',
  admin: 'Can manage',
}

// Mock data
const MOCK_MEMBERS: Collaborator[] = [
  { id: 'u1', displayName: 'You', email: 'you@example.com', role: 'admin', joinedAt: '2024-01-01', online: true },
  { id: 'u2', displayName: 'Alex Kim', email: 'alex@example.com', role: 'editor', joinedAt: '2024-01-03', online: true },
  { id: 'u3', displayName: 'Sam Rivera', email: 'sam@example.com', role: 'viewer', joinedAt: '2024-01-05' },
]

export default function CollaboratePage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<TabId>('members')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('editor')
  const [inviting, setInviting] = useState(false)
  const [shareLink] = useState(`https://creati.ai/share/${projectId}`)
  const [linkCopied, setLinkCopied] = useState(false)
  const [linkRole, setLinkRole] = useState<Role>('viewer')
  const [linkEnabled, setLinkEnabled] = useState(true)

  const { data: members = MOCK_MEMBERS } = useQuery({
    queryKey: ['collaborators', projectId],
    queryFn: async () => {
      try {
        const res = await api.get(`/projects/${projectId}/collaborators`)
        return res.data as Collaborator[]
      } catch {
        return MOCK_MEMBERS
      }
    },
  })

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      await api.post(`/projects/${projectId}/collaborators/invite`, { email: inviteEmail, role: inviteRole })
      toast.success(`Invited ${inviteEmail}`)
      setInviteEmail('')
      queryClient.invalidateQueries({ queryKey: ['collaborators', projectId] })
    } catch {
      toast.error('Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (memberId: string, role: Role) => {
    try {
      await api.patch(`/projects/${projectId}/collaborators/${memberId}`, { role })
      queryClient.invalidateQueries({ queryKey: ['collaborators', projectId] })
    } catch {
      toast.error('Failed to update role')
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this collaborator?')) return
    try {
      await api.delete(`/projects/${projectId}/collaborators/${memberId}`)
      queryClient.invalidateQueries({ queryKey: ['collaborators', projectId] })
    } catch {
      toast.error('Failed to remove collaborator')
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'members', label: `Members (${members.length})` },
    { id: 'invite', label: 'Invite' },
    { id: 'link', label: 'Share link' },
  ]

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
            <h1 className="font-display font-bold text-lg tracking-tight">Collaborators</h1>
            <p className="font-body text-xs text-[var(--text-muted)]">Manage who has access to this canvas</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-12">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-input)] rounded-2xl border border-[var(--border)]/50 mb-8 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative px-6 py-2.5 rounded-xl font-display font-bold tracking-wide text-xs transition-colors ${
                activeTab === t.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {activeTab === t.id && (
                <motion.div
                  layoutId="collab-tab"
                  className="absolute inset-0 bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border)]/50"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border)]/50 rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-lg">Project Members</h2>
                  <span className="font-mono text-xs text-[var(--text-muted)] bg-[var(--bg-input)] px-3 py-1 rounded-lg border border-[var(--border)]/50">{members.length} total</span>
                </div>
                
                <div className="space-y-3">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)]/50 bg-[var(--bg-card)] hover:border-[var(--purple)]/30 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--purple)]/20 to-[var(--cyan)]/20 flex items-center justify-center border border-[var(--border)]/50 text-lg font-display font-bold text-[var(--text-primary)]">
                            {m.displayName.charAt(0)}
                          </div>
                          {m.online && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[var(--success)] border-2 border-[var(--bg-card)] shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                          )}
                        </div>
                        <div>
                          <p className="font-display font-bold text-sm flex items-center gap-2">
                            {m.displayName}
                            {m.id === 'u1' && <span className="font-mono text-[10px] text-[var(--purple)] bg-[var(--purple)]/10 px-2 py-0.5 rounded-md border border-[var(--purple)]/20">You</span>}
                          </p>
                          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">{m.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {m.id !== 'u1' ? (
                          <>
                            <select
                              value={m.role}
                              onChange={(e) => handleRoleChange(m.id, e.target.value as Role)}
                              className="bg-[var(--bg-input)] border border-[var(--border)]/50 rounded-xl px-3 py-2 font-body text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--purple)]/50 transition-colors cursor-pointer appearance-none pr-8 relative"
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '12px' }}
                            >
                              <option value="viewer">Can view</option>
                              <option value="editor">Can edit</option>
                              <option value="admin">Can manage</option>
                            </select>
                            <button
                              onClick={() => handleRemove(m.id)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove member"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <span className="font-body text-xs text-[var(--text-muted)] px-3 py-2 bg-[var(--bg-input)] rounded-xl border border-[var(--border)]/50">Owner</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invite Tab */}
            {activeTab === 'invite' && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display font-bold text-lg mb-2">Invite via Email</h2>
                  <p className="font-body text-sm text-[var(--text-muted)]">Send an email invitation to collaborate on this canvas.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-secondary)] mb-2 ml-1">Email Address</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)]/50 rounded-2xl px-4 py-3 font-body text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)]/50 focus:ring-1 focus:ring-[var(--purple)]/50 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-secondary)] mb-2 ml-1">Role</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['viewer', 'editor', 'admin'] as Role[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setInviteRole(r)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            inviteRole === r
                              ? 'border-[var(--purple)] bg-[var(--purple)]/10 shadow-[0_0_20px_rgba(123,97,255,0.1)]'
                              : 'border-[var(--border)]/50 bg-[var(--bg-input)] hover:border-[var(--purple)]/30'
                          }`}
                        >
                          <div className="font-display font-bold text-sm mb-1 capitalize">{r}</div>
                          <div className="font-body text-xs text-[var(--text-muted)]">{ROLE_LABELS[r]}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim() || inviting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] text-white font-display font-bold text-sm shadow-[0_0_20px_rgba(123,97,255,0.3)] hover:shadow-[0_0_30px_rgba(123,97,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {inviting ? 'Sending Invite...' : 'Send Invitation'}
                  </button>
                </div>
              </div>
            )}

            {/* Link Tab */}
            {activeTab === 'link' && (
              <div className="space-y-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display font-bold text-lg mb-2">Share Link</h2>
                    <p className="font-body text-sm text-[var(--text-muted)]">Anyone with this link can access the canvas based on the role below.</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={linkEnabled}
                    onClick={() => setLinkEnabled(!linkEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${linkEnabled ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${linkEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                
                <div className={`transition-opacity duration-300 ${linkEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-body text-sm text-[var(--text-secondary)]">Link access:</span>
                    <select
                      value={linkRole}
                      onChange={(e) => setLinkRole(e.target.value as Role)}
                      className="bg-[var(--bg-input)] border border-[var(--border)]/50 rounded-xl px-3 py-1.5 font-body text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--purple)]/50 transition-colors cursor-pointer appearance-none pr-8 relative"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23fff' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '12px' }}
                    >
                      <option value="viewer">Anyone can view</option>
                      <option value="editor">Anyone can edit</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[var(--bg-input)] border border-[var(--border)]/50 rounded-2xl px-4 py-3 font-mono text-sm text-[var(--text-secondary)] truncate select-all">
                      {shareLink}
                    </div>
                    <button
                      onClick={copyLink}
                      className="px-6 py-3 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border)]/50 font-display font-bold text-sm text-[var(--text-primary)] hover:bg-[var(--bg-input)] hover:border-[var(--purple)]/50 transition-all flex items-center gap-2 min-w-[120px] justify-center"
                    >
                      {linkCopied ? (
                        <><span className="text-[var(--success)]">✓</span> Copied</>
                      ) : (
                        <><span>📋</span> Copy</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
