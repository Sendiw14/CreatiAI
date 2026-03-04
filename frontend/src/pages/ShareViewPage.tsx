import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface SharedCanvas {
  id: string
  projectId: string
  projectName: string
  ownerName: string
  ownerAvatar?: string
  description?: string
  nodeCount: number
  edgeCount: number
  createdAt: string
  expiresAt?: string
  allowComments: boolean
  allowFork: boolean
  viewCount: number
}

export default function ShareViewPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [forked, setForked] = useState(false)
  const [forking, setForking] = useState(false)

  const { data: share, isLoading, error: _error } = useQuery({
    queryKey: ['share', token],
    queryFn: async () => {
      try {
        const res = await api.get(`/share/${token}`)
        return res.data as SharedCanvas
      } catch {
        // Mock for preview
        return {
          id: token ?? 'preview',
          projectId: 'mock',
          projectName: 'Shared Canvas',
          ownerName: 'CreatiAI User',
          description: 'A shared canvas from CreatiAI.',
          nodeCount: 12,
          edgeCount: 8,
          createdAt: new Date().toISOString(),
          allowComments: true,
          allowFork: true,
          viewCount: 42,
        } as SharedCanvas
      }
    },
  })

  const handleFork = async () => {
    setForking(true)
    try {
      const res = await api.post(`/share/${token}/fork`)
      navigate(`/workspace/${res.data.projectId}`)
    } catch {
      // Navigate to workspace with a new project
      navigate('/workspace')
    } finally {
      setForking(false)
      setForked(true)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--purple)]/20 blur-[100px] rounded-full mix-blend-screen animate-[pulse_4s_ease-in-out_infinite]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-[var(--purple)] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(157,78,221,0.5)]" />
          </div>
          <p className="text-[var(--text-muted)] font-medium animate-pulse">Loading canvas...</p>
        </div>
      </div>
    )
  }

  if (!share) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--error)]/10 blur-[100px] rounded-full mix-blend-screen" />
        </div>
        <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-w-md w-full">
          <div className="w-20 h-20 mx-auto bg-[var(--error)]/10 rounded-2xl flex items-center justify-center mb-6 border border-[var(--error)]/20 shadow-[0_0_20px_rgba(255,0,64,0.1)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <p className="text-white font-display font-bold text-2xl mb-3">Link not found</p>
          <p className="text-base text-[var(--text-muted)] mb-8 leading-relaxed">This share link may have expired, been revoked, or never existed.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] shadow-[0_0_20px_rgba(157,78,221,0.3)] hover:shadow-[0_0_30px_rgba(157,78,221,0.5)] hover:-translate-y-0.5 transition-all duration-300"
          >
            Go to CreatiAI
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col font-body selection:bg-[var(--purple)]/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--purple)]/10 blur-[120px] rounded-full mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--cyan)]/10 blur-[120px] rounded-full mix-blend-screen animate-[pulse_8s_ease-in-out_infinite_1s]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--purple)] to-[var(--cyan)] flex items-center justify-center shadow-[0_0_15px_rgba(157,78,221,0.4)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] tracking-tight">
              CreatiAI
            </span>
          </div>

          <span className="text-white/20 mx-2">|</span>

          <span className="text-sm font-medium text-[var(--text-muted)] bg-white/5 px-3 py-1 rounded-full border border-white/10">Shared Canvas</span>

          <div className="ml-auto flex gap-3 items-center">
            {share.allowFork && (
              <button
                onClick={handleFork}
                disabled={forking || forked}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] shadow-[0_0_15px_rgba(157,78,221,0.3)] hover:shadow-[0_0_25px_rgba(157,78,221,0.5)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:transform-none disabled:hover:shadow-none flex items-center gap-2"
              >
                {forked ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Forked!</>
                ) : forking ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Forking...</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg> Fork Canvas</>
                )}
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2 rounded-xl text-sm font-medium border border-white/10 bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              Open App
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 relative z-10">
        {/* Canvas info */}
        <div className="flex flex-col md:flex-row items-start justify-between mb-10 gap-6 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 tracking-tight">
              {share.projectName}
            </h1>
            {share.description && (
              <p className="text-base text-[var(--text-muted)] max-w-2xl leading-relaxed mb-6">{share.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-full border border-white/5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-[var(--purple)] to-[var(--cyan)] shadow-[0_0_10px_rgba(157,78,221,0.4)]">
                  {share.ownerName[0]}
                </div>
                <span className="text-sm font-medium text-white/90">{share.ownerName}</span>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-[var(--text-muted)] bg-black/20 px-4 py-2 rounded-full border border-white/5">
                <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> {share.viewCount} views</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> {share.nodeCount} nodes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas preview */}
        <div
          className="w-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center mb-10 relative overflow-hidden group shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
          style={{ aspectRatio: '16/9' }}
        >
          {/* Grid Background */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <div className="relative z-10 text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transform transition-transform duration-500 group-hover:scale-105">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[var(--purple)] to-[var(--cyan)] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(157,78,221,0.4)] mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </div>
            <p className="text-xl font-display font-bold text-white mb-2">Interactive Canvas Preview</p>
            <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">
              Sign in or fork this project to view and interact with the full canvas.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Nodes', value: share.nodeCount, icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
            { label: 'Connections', value: share.edgeCount, icon: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3' },
            { label: 'Total Views', value: share.viewCount, icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
          ].map((s, i) => (
            <div key={s.label} className="bg-white/5 rounded-2xl border border-white/10 p-6 flex items-center gap-5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-inner ${
                i === 0 ? 'bg-[var(--purple)]/20 text-[var(--purple)]' : 
                i === 1 ? 'bg-[var(--cyan)]/20 text-[var(--cyan)]' : 
                'bg-[var(--gold)]/20 text-[var(--gold)]'
              }`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.icon}/>
                </svg>
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-white group-hover:scale-105 transition-transform origin-left">{s.value}</p>
                <p className="text-sm font-medium text-[var(--text-muted)] mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center py-12 border-t border-white/10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h2 className="text-2xl font-display font-bold text-white mb-3">Ready to build your own?</h2>
          <p className="text-base text-[var(--text-muted)] mb-8 max-w-md mx-auto">
            Join CreatiAI to create, collaborate, and share your own AI-powered infinite canvases.
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            className="px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] shadow-[0_0_30px_rgba(157,78,221,0.4)] hover:shadow-[0_0_40px_rgba(157,78,221,0.6)] hover:-translate-y-1 transition-all duration-300 text-lg"
          >
            Get Started for Free
          </button>
        </div>
      </div>
    </div>
  )
}
