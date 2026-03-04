import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUserStore } from '../../stores/userStore'

interface LearningInsight {
  category: string
  strength: number
  description: string
}

interface LearningSession {
  date: string
  type: string
  duration: number
  insights: string[]
}

export default function LearningPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [activeTab, setActiveTab] = useState<'insights' | 'history' | 'model'>('insights')

  const insights: LearningInsight[] = [
    { category: 'Visual thinking', strength: 82, description: 'You tend to anchor ideas with imagery before text.' },
    { category: 'Divergent exploration', strength: 67, description: 'Strong lateral thinking across multiple domains.' },
    { category: 'Iterative refinement', strength: 74, description: 'You revise ideas 3× more than the average user.' },
    { category: 'Cross-domain synthesis', strength: 58, description: 'Connecting ideas across disparate fields.' },
    { category: 'Narrative structure', strength: 45, description: 'Sequential storytelling is less dominant in your style.' },
  ]

  const sessions: LearningSession[] = [
    { date: '2 days ago', type: 'Canvas session', duration: 47, insights: ['Prefers spatial grouping', 'Typically starts with a text anchor'] },
    { date: '4 days ago', type: 'AI co-creation', duration: 23, insights: ['Responds well to contrarian perspectives', 'Frequently branches alternatives'] },
    { date: '1 week ago', type: 'Sketch session', duration: 61, insights: ['Visual abstractions precede verbal articulation'] },
  ]

  const tabs = [
    { id: 'insights', label: 'My insights' },
    { id: 'history', label: 'Learning history' },
    { id: 'model', label: 'About my model' },
  ] as const

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Profile
          </button>
          <span className="text-[var(--border)]">/</span>
          <span className="text-[var(--text-primary)] text-sm font-medium">Learning</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">My learning model</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            CreatiAI builds a personal model of how you think and create — purely to serve you better.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border)] w-fit mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Insights tab */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              {insights.map(insight => (
                <div
                  key={insight.category}
                  className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[var(--text-primary)]">{insight.category}</h3>
                    <span className="text-sm font-mono" style={{
                      color: insight.strength > 70 ? 'var(--cyan)' : insight.strength > 50 ? 'var(--purple)' : 'var(--text-muted)'
                    }}>
                      {insight.strength}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden mb-3">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: insight.strength > 70
                          ? 'var(--cyan)'
                          : insight.strength > 50
                          ? 'var(--gradient-brand)'
                          : 'var(--border)',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${insight.strength}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                    />
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{insight.description}</p>
                </div>
              ))}

              <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-5 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  These insights are generated from your canvas sessions and AI interactions.
                  The more you create, the more accurate they become.
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2 opacity-60">
                  Based on {user?.projectIds?.length ?? 0} projects · updated continuously
                </p>
              </div>
            </div>
          )}

          {/* History tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {sessions.map((session, i) => (
                <div key={i} className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">{session.type}</h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{session.date} · {session.duration} min</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--purple)]/15 text-[var(--purple)]">
                      +{session.insights.length} insights
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {session.insights.map((insight, j) => (
                      <li key={j} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-[var(--cyan)] mt-2 shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Model tab */}
          {activeTab === 'model' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-6">
                <h3 className="font-medium text-[var(--text-primary)] mb-3">How your model works</h3>
                <div className="space-y-3 text-sm text-[var(--text-muted)]">
                  <p>CreatiAI builds a personal creative model by observing patterns in how you:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      'Initiate canvas sessions (text, sketch, or image first)',
                      'Interact with AI suggestions (accept, branch, or challenge)',
                      'Arrange ideas spatially on the canvas',
                      'Revise and iterate on concepts',
                      'Use What-If mode and alternative paths',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-[var(--purple)] mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-6">
                <h3 className="font-medium text-[var(--text-primary)] mb-3">Privacy</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Your learning model is private by default and never shared with other users.
                  You can reset or export it at any time.
                </p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)] transition-colors">
                    Export model data
                  </button>
                  <button className="px-4 py-2 rounded-lg text-sm border border-[var(--error)]/40 text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors">
                    Reset model
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
