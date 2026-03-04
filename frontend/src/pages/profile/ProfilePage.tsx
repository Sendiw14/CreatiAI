import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../stores/userStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useUserStore()

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [bio, setBio] = useState(user?.profile?.bio ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile')

  // Security fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarPreview(url)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateProfile({ displayName, profile: { ...user?.profile, bio } })
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setChangingPassword(true)
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This cannot be undone.'
    )
    if (!confirmed) return
    try {
      await api.delete('/auth/account')
      logout()
      navigate('/')
    } catch {
      toast.error('Failed to delete account')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'sessions', label: 'Sessions' },
  ] as const

  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate('/workspace')}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Workspace
          </button>
          <span className="text-[var(--border)]">/</span>
          <span className="text-[var(--text-primary)] text-sm font-medium">Profile</span>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => navigate('/profile/preferences')}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5"
            >
              Preferences
            </button>
            <button
              onClick={() => navigate('/profile/learning')}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5"
            >
              Learning
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-56 shrink-0">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 p-6 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] mb-4">
              <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-bold text-[var(--bg-page)]"
                    style={{ background: 'var(--gradient-brand)' }}
                  >
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 17l3.5-1L17 5.5a2.12 2.12 0 00-3-3L3 13.5V17z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <div className="text-center">
                <p className="font-medium text-[var(--text-primary)] text-sm">{displayName || 'Anonymous'}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{user?.email}</p>
              </div>
              {user?.role === 'admin' && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--purple)]/20 text-[var(--purple)]">
                  Admin
                </span>
              )}
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[var(--purple)]/15 text-[var(--purple)] font-medium'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <hr className="border-[var(--border)] my-2" />
              <button
                onClick={() => { logout(); navigate('/') }}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
              >
                Sign out
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-1">
                      Public profile
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      This is how others see you across CreatiAI.
                    </p>
                  </div>

                  <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-6 space-y-5">
                    <Input
                      label="Display name"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Your name"
                    />

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Tell the world what you create..."
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]
                                   text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm
                                   focus:outline-none focus:border-[var(--purple)] transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Email
                      </label>
                      <div className="px-3 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-muted)] text-sm">
                        {user?.email}
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Email changes require re-verification.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleSaveProfile}
                        isLoading={saving}
                        variant="gradient"
                        size="sm"
                      >
                        Save changes
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Projects', value: user?.projectIds?.length ?? 0 },
                      { label: 'AI interactions', value: '—' },
                      { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '—' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-4 text-center">
                        <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{stat.value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-1">
                      Security
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      Manage your password and account security.
                    </p>
                  </div>

                  <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-6 space-y-5">
                    <h3 className="font-medium text-[var(--text-primary)]">Change password</h3>
                    <Input
                      label="Current password"
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <Input
                      label="New password"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <Input
                      label="Confirm new password"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleChangePassword}
                        isLoading={changingPassword}
                        variant="gradient"
                        size="sm"
                      >
                        Update password
                      </Button>
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--error)]/30 p-6">
                    <h3 className="font-medium text-[var(--error)] mb-2">Danger zone</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="ghost"
                      size="sm"
                      className="border border-[var(--error)]/40 text-[var(--error)] hover:bg-[var(--error)]/10"
                    >
                      Delete account
                    </Button>
                  </div>
                </div>
              )}

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-1">
                      Active sessions
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      Devices currently signed in to your account.
                    </p>
                  </div>

                  <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
                    {[
                      { device: 'MacBook Pro', location: 'San Francisco, CA', time: 'Current session', current: true },
                      { device: 'iPhone 15', location: 'San Francisco, CA', time: '2 hours ago', current: false },
                    ].map((session, i) => (
                      <div key={i} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                              <rect x="1" y="3" width="16" height="11" rx="2" stroke="var(--text-muted)" strokeWidth="1.5"/>
                              <path d="M6 14v2M12 14v2M4 16h10" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                              {session.device}
                              {session.current && (
                                <span className="px-1.5 py-0.5 rounded text-xs bg-[var(--success)]/20 text-[var(--success)]">
                                  This device
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">{session.location} · {session.time}</p>
                          </div>
                        </div>
                        {!session.current && (
                          <button className="text-xs text-[var(--error)] hover:underline">
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button className="text-sm text-[var(--error)] hover:underline">
                    Sign out all other sessions
                  </button>
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}
