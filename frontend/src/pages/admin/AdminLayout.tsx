import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useUserStore } from '../../stores/userStore'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M1 13c0-2 2-3.5 5-3.5s5 1.5 5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M12 7v4M14 9h-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    path: '/admin/analytics',
    label: 'Analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12L5 8l3 2 4-6 2 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 14h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    path: '/admin/governance',
    label: 'AI Governance',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11l-1.5-3.5L3 6l3.5-1.5L8 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 2"/>
      </svg>
    ),
  },
  {
    path: '/admin/flags',
    label: 'Feature Flags',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 14V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M3 2h9l-2 4 2 4H3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: '/admin/audit',
    label: 'Audit Log',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    path: '/admin/billing',
    label: 'Billing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M1 7h14" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M4 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex font-body selection:bg-[var(--purple)]/30 selection:text-white">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? 'w-16' : 'w-64'} shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col transition-all duration-300 relative z-20`}
      >
        {/* Logo + title */}
        <div className="h-16 flex items-center px-4 border-b border-white/10 gap-3 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[var(--purple)]/10 to-transparent opacity-50 pointer-events-none" />
          <span
            className="text-lg font-display font-black shrink-0"
            style={{
              background: 'var(--gradient-main)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ✦
          </span>
          {!sidebarCollapsed && (
            <span className="text-sm font-display font-bold text-white tracking-wide">
              Admin
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d={sidebarCollapsed ? 'M5 3l4 4-4 4' : 'M9 3L5 7l4 4'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-[var(--purple)]/20 text-white font-semibold border border-[var(--purple)]/30 shadow-[0_0_15px_rgba(157,78,221,0.15)]'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                }`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-gradient-to-b from-[var(--purple)] to-[var(--cyan)] rounded-r-full" />
                  )}
                  <span className={`shrink-0 transition-colors duration-300 ${isActive ? 'text-[var(--cyan)]' : 'group-hover:text-[var(--purple)]'}`}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + back */}
        <div className="p-3 border-t border-white/10 space-y-1 bg-black/20">
          <button
            onClick={() => navigate('/workspace')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 group"
            title={sidebarCollapsed ? 'Back to app' : undefined}
          >
            <span className="shrink-0 group-hover:-translate-x-1 transition-transform duration-300">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </span>
            {!sidebarCollapsed && <span className="font-medium">Back to app</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col relative">
        {/* Background mesh for main content */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--purple)]/5 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--cyan)]/5 blur-[120px] rounded-full mix-blend-screen" />
        </div>

        {/* Top bar */}
        <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-md flex items-center px-8 shrink-0 relative z-10">
          <div className="ml-auto flex items-center gap-4">
            <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-mono font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(239,68,68,0.1)]">
              Admin mode
            </span>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(157,78,221,0.3)] border border-white/20"
              style={{ background: 'var(--gradient-main)' }}
            >
              {user?.displayName?.[0] ?? user?.email?.[0] ?? 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto relative z-10 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
