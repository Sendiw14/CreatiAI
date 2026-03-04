import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glitch number */}
        <div className="relative mb-8 select-none">
          <span
            className="text-[10rem] font-display font-black leading-none"
            style={{
              background: 'linear-gradient(135deg, var(--purple) 0%, var(--cyan) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </span>
          <motion.span
            className="absolute inset-0 text-[10rem] font-display font-black leading-none text-[var(--cyan)] opacity-20"
            animate={{ x: [-2, 2, -2], y: [1, -1, 1] }}
            transition={{ duration: 0.15, repeat: Infinity, repeatType: 'mirror' }}
            style={{ clipPath: 'inset(33% 0 33% 0)' }}
          >
            404
          </motion.span>
        </div>

        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3">
          Lost in the creative void
        </h1>
        <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
          This page doesn't exist — or maybe it's hiding in a collapsed canvas node.
          Either way, let's get you back to somewhere real.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--text-secondary)]
                       hover:border-[var(--purple)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Go back
          </button>
          <button
            onClick={() => navigate('/workspace')}
            className="px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--gradient-brand)' }}
          >
            Open workspace
          </button>
        </div>

        {/* Floating orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
          <motion.div
            className="absolute w-64 h-64 rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, var(--purple) 0%, transparent 70%)',
              top: '20%',
              left: '10%',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, var(--cyan) 0%, transparent 70%)',
              bottom: '20%',
              right: '10%',
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>
      </motion.div>
    </div>
  )
}
