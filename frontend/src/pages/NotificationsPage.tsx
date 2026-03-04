import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { useNotificationStore } from '../stores/notificationStore'
import type { Notification } from '../types'

type FilterType = 'all' | 'mention' | 'collab' | 'ai' | 'system'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    removeNotification,
    clearAll,
  } = useNotificationStore()

  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true
    return n.type === filter
  })

  const getIcon = (type: Notification['type']) => {
    const base = 'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner backdrop-blur-md border border-white/10'
    const map: Record<string, { bg: string; icon: React.ReactNode }> = {
      mention: {
        bg: 'bg-[var(--purple)]/20 shadow-[0_0_15px_rgba(157,78,221,0.2)]',
        icon: (
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="var(--purple)" strokeWidth="1.5"/>
            <path d="M8 5v3l2 2" stroke="var(--purple)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      collab: {
        bg: 'bg-[var(--cyan)]/20 shadow-[0_0_15px_rgba(0,229,255,0.2)]',
        icon: (
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <circle cx="6" cy="5" r="2.5" stroke="var(--cyan)" strokeWidth="1.5"/>
            <circle cx="11" cy="5" r="2.5" stroke="var(--cyan)" strokeWidth="1.5"/>
            <path d="M2 13c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      ai: {
        bg: 'bg-[var(--gold)]/20 shadow-[0_0_15px_rgba(255,215,0,0.2)]',
        icon: (
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M8 2l1.5 3.5L13 7l-3.5 1.5L8 12l-1.5-3.5L3 7l3.5-1.5L8 2z" stroke="var(--gold)" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        ),
      },
      success: {
        bg: 'bg-[var(--success)]/20 shadow-[0_0_15px_rgba(0,255,128,0.2)]',
        icon: (
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="var(--success)" strokeWidth="1.5"/>
            <path d="M5 8l2 2 4-4" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
      error: {
        bg: 'bg-[var(--error)]/20 shadow-[0_0_15px_rgba(255,0,64,0.2)]',
        icon: (
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="var(--error)" strokeWidth="1.5"/>
            <path d="M8 5v3M8 10v1" stroke="var(--error)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
    }
    const entry = map[type] ?? map.success
    return (
      <div className={`${base} ${entry.bg}`}>
        {entry.icon}
      </div>
    )
  }

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'mention', label: 'Mentions' },
    { id: 'collab', label: 'Collaboration' },
    { id: 'ai', label: 'AI' },
    { id: 'system', label: 'System' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col font-body selection:bg-[var(--purple)]/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-[var(--text-muted)] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-lg font-display font-bold text-white flex items-center">
            Notifications
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] text-white shadow-[0_0_15px_rgba(157,78,221,0.5)]"
              >
                {unreadCount}
              </motion.span>
            )}
          </h1>
          <div className="ml-auto flex gap-4 items-center">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-sm font-medium text-[var(--cyan)] hover:text-white hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all duration-300"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors duration-300"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 w-full">
        {/* Filter tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border ${
                filter === f.id
                  ? 'border-[var(--purple)] bg-[var(--purple)]/20 text-white shadow-[0_0_20px_rgba(157,78,221,0.2)]'
                  : 'border-white/10 bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9" stroke="var(--text-muted)" strokeWidth="1.5"/>
                <path d="M13.73 21a2 2 0 01-3.46 0" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[var(--text-primary)] text-lg font-medium mb-2">No notifications</p>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">
              You're all caught up! New activity will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95, height: 0, marginBottom: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.05 }}
                  onClick={() => markRead(notif.id)}
                  className={`group flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-xl ${
                    !notif.read
                      ? 'bg-white/10 border-[var(--purple)]/50 shadow-[0_8px_32px_rgba(157,78,221,0.1)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:-translate-y-0.5'
                  }`}
                >
                  {getIcon(notif.type)}

                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className={`text-sm leading-relaxed transition-colors duration-300 ${notif.read ? 'text-[var(--text-muted)] group-hover:text-white/80' : 'text-white font-medium'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-[var(--cyan)] mt-1.5 font-medium opacity-80">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-1">
                    {!notif.read && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 rounded-full bg-[var(--purple)] shadow-[0_0_10px_rgba(157,78,221,0.8)]" 
                      />
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); removeNotification(notif.id) }}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-[var(--text-muted)] hover:text-[var(--error)]"
                    >
                      <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                        <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
