import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

interface SessionEvent {
  id: string
  timestamp: number
  type: 'node_add' | 'node_move' | 'node_delete' | 'edge_add' | 'ai_prompt' | 'checkpoint'
  actorId: string
  actorName: string
  payload: Record<string, unknown>
  description: string
}

// Mock session events
const MOCK_EVENTS: SessionEvent[] = [
  { id: 'e1', timestamp: Date.now() - 3600000, type: 'ai_prompt', actorId: 'u1', actorName: 'You', payload: {}, description: 'Asked AI: "What are the core values of this brand?"' },
  { id: 'e2', timestamp: Date.now() - 3540000, type: 'node_add', actorId: 'u1', actorName: 'You', payload: { type: 'text' }, description: 'Added text node: "Boldness, Clarity, Motion"' },
  { id: 'e3', timestamp: Date.now() - 3480000, type: 'edge_add', actorId: 'u1', actorName: 'You', payload: {}, description: 'Connected AI response to text node' },
  { id: 'e4', timestamp: Date.now() - 3360000, type: 'node_add', actorId: 'u2', actorName: 'Alex Kim', payload: { type: 'image' }, description: 'Alex added image node' },
  { id: 'e5', timestamp: Date.now() - 3240000, type: 'node_move', actorId: 'u1', actorName: 'You', payload: {}, description: 'Reorganized canvas layout' },
  { id: 'e6', timestamp: Date.now() - 3000000, type: 'checkpoint', actorId: 'u1', actorName: 'You', payload: {}, description: '📌 Checkpoint: Initial concept locked' },
  { id: 'e7', timestamp: Date.now() - 2700000, type: 'ai_prompt', actorId: 'u1', actorName: 'You', payload: {}, description: 'Asked AI: "Challenge this direction"' },
  { id: 'e8', timestamp: Date.now() - 2400000, type: 'node_add', actorId: 'u1', actorName: 'You', payload: { type: 'ai_generated' }, description: 'Added AI-generated concept node' },
]

export default function SessionReplayPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [playing, setPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [speed, setSpeed] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [events] = useState<SessionEvent[]>(MOCK_EVENTS)

  const currentEvent = events[currentIndex]
  const progress = events.length > 1 ? (currentIndex / (events.length - 1)) * 100 : 0

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= events.length - 1) {
            setPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1200 / speed)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, speed, events.length])

  const typeColor = (type: SessionEvent['type']) => ({
    node_add: 'text-[var(--cyan)] bg-[var(--cyan)]/15',
    node_move: 'text-[var(--text-muted)] bg-[var(--bg-surface)]',
    node_delete: 'text-[var(--error)] bg-[var(--error)]/15',
    edge_add: 'text-[var(--purple)] bg-[var(--purple)]/15',
    ai_prompt: 'text-[var(--gold)] bg-[var(--gold)]/15',
    checkpoint: 'text-[var(--success)] bg-[var(--success)]/15',
  }[type] ?? 'text-[var(--text-muted)] bg-[var(--bg-elevated)]')

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col font-body selection:bg-[var(--purple)]/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-[var(--bg-surface)]/60 backdrop-blur-xl shrink-0 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(`/workspace/${projectId}`)}
            className="group flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            Back to Canvas
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-pulse" />
            <span className="text-[var(--text-primary)] text-sm font-display font-medium tracking-wide">Session Replay</span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
        {/* Canvas preview area */}
        <div className="relative bg-[var(--bg-card)]/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
          style={{ aspectRatio: '16/7' }}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />

          {/* Simulated canvas */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {events.slice(0, currentIndex + 1).map((e, i) => {
                if (e.type !== 'node_add' && e.type !== 'ai_prompt') return null
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`absolute rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md ${typeColor(e.type)} border-current/30`}
                    style={{
                      left: `${15 + (i % 4) * 22}%`,
                      top: `${20 + Math.floor(i / 4) * 35}%`,
                    }}
                  >
                    {e.type === 'ai_prompt' ? '✦ AI' : e.payload.type as string}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Overlay: current event */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              {currentEvent && (
                <motion.div
                  key={currentEvent.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="bg-black/80 backdrop-blur-xl rounded-2xl px-6 py-4 text-sm text-white max-w-lg shadow-2xl border border-white/10 flex items-center gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-white/50 text-xs font-mono tracking-wider">
                      {format(new Date(currentEvent.timestamp), 'HH:mm:ss')}
                    </span>
                    <span className="font-medium text-white/90">{currentEvent.description}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[var(--bg-card)]/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
          {/* Progress bar */}
          <div
            className="h-2 bg-white/5 rounded-full overflow-hidden mb-6 cursor-pointer relative group"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              setCurrentIndex(Math.round(pct * (events.length - 1)))
            }}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div
              className="h-full rounded-full transition-all duration-300 relative"
              style={{ width: `${progress}%`, background: 'var(--gradient-brand)' }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Step back */}
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 text-[var(--text-muted)] border border-white/5"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11 3L5 8l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Play/pause */}
            <button
              onClick={() => {
                if (currentIndex >= events.length - 1) setCurrentIndex(0)
                setPlaying(!playing)
              }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-[var(--bg-page)] transition-all hover:scale-105 hover:shadow-[0_0_20px_var(--purple)]"
              style={{ background: 'var(--gradient-brand)' }}
            >
              {playing ? (
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="1" width="4" height="12" rx="1.5" fill="currentColor"/>
                  <rect x="8" y="1" width="4" height="12" rx="1.5" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="ml-1">
                  <path d="M3 1.5L13 7 3 12.5V1.5z" fill="currentColor"/>
                </svg>
              )}
            </button>

            {/* Step forward */}
            <button
              onClick={() => setCurrentIndex(i => Math.min(events.length - 1, i + 1))}
              disabled={currentIndex >= events.length - 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 text-[var(--text-muted)] border border-white/5"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-6 bg-white/5 rounded-xl px-4 py-2 border border-white/5">
              <span className="text-sm text-[var(--text-muted)] font-mono font-medium">
                <span className="text-[var(--text-primary)]">{currentIndex + 1}</span> / {events.length}
              </span>

              <div className="w-px h-4 bg-white/10" />

              {/* Speed control */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium mr-2">Speed</span>
                {[0.5, 1, 2, 4].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      speed === s
                        ? 'bg-[var(--purple)]/20 text-[var(--purple)] border border-[var(--purple)]/30'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Event timeline */}
        <div className="bg-[var(--bg-card)]/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
          <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-widest mb-6 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--purple)]">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Timeline
          </h3>
          <div className="space-y-2">
            {events.map((e, i) => (
              <button
                key={e.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                  i === currentIndex
                    ? 'bg-[var(--purple)]/10 border border-[var(--purple)]/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                    : i < currentIndex
                    ? 'opacity-60 hover:opacity-100 hover:bg-white/5 border border-transparent'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 border border-current/20 ${typeColor(e.type)}`}>
                  {e.type.replace('_', ' ')}
                </span>
                <span className={`text-sm flex-1 truncate ${i === currentIndex ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                  {e.description}
                </span>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-[var(--text-muted)] font-mono bg-white/5 px-2 py-1 rounded-md">
                    {format(new Date(e.timestamp), 'HH:mm')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--cyan)] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                      {e.actorName.charAt(0)}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] font-medium">{e.actorName}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
