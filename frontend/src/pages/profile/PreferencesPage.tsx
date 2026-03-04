import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../stores/userStore'
import { Button } from '../../components/ui/Button'
import toast from 'react-hot-toast'

type Theme = 'dark' | 'light' | 'system'
type Density = 'compact' | 'comfortable' | 'spacious'
type AIPersonality = 'conservative' | 'balanced' | 'creative' | 'experimental'

export default function PreferencesPage() {
  const navigate = useNavigate()
  const { updateProfile } = useUserStore()

  const [theme, setTheme] = useState<Theme>('dark')
  const [density, setDensity] = useState<Density>('comfortable')
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>('balanced')
  const [assertiveness, setAssertiveness] = useState(2)
  const [autoSave, setAutoSave] = useState(true)
  const [autoSaveInterval, setAutoSaveInterval] = useState(30)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({
        aiPersonality,
      })
      toast.success('Preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) => (
    <div className="flex items-center justify-between">
      {label && <span className="text-sm text-[var(--text-secondary)]">{label}</span>}
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-[var(--purple)]' : 'bg-[var(--border)]'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-6 space-y-4">
      <h3 className="font-medium text-[var(--text-primary)] text-sm uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      {/* Header */}
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
          <span className="text-[var(--text-primary)] text-sm font-medium">Preferences</span>
          <div className="ml-auto">
            <Button onClick={handleSave} isLoading={saving} variant="gradient" size="sm">
              Save preferences
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Preferences</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Customize your CreatiAI experience.</p>
        </div>

        {/* Appearance */}
        <Section title="Appearance">
          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-3">Theme</p>
            <div className="flex gap-3">
              {(['dark', 'light', 'system'] as Theme[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors border ${
                    theme === t
                      ? 'border-[var(--purple)] bg-[var(--purple)]/15 text-[var(--purple)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-3">Density</p>
            <div className="flex gap-3">
              {(['compact', 'comfortable', 'spacious'] as Density[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors border ${
                    density === d
                      ? 'border-[var(--purple)] bg-[var(--purple)]/15 text-[var(--purple)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <Toggle value={animationsEnabled} onChange={setAnimationsEnabled} label="Enable animations" />
        </Section>

        {/* AI Behavior */}
        <Section title="AI Behavior">
          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">AI personality</p>
            <p className="text-xs text-[var(--text-muted)] mb-3">How opinionated and creative should the AI be by default?</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {([
                { id: 'conservative', label: 'Conservative', desc: 'Careful, precise' },
                { id: 'balanced', label: 'Balanced', desc: 'Thoughtful blend' },
                { id: 'creative', label: 'Creative', desc: 'Bold, experimental' },
                { id: 'experimental', label: 'Experimental', desc: 'Wildly divergent' },
              ] as { id: AIPersonality; label: string; desc: string }[]).map(p => (
                <button
                  key={p.id}
                  onClick={() => setAiPersonality(p.id)}
                  className={`p-3 rounded-lg text-left border transition-colors ${
                    aiPersonality === p.id
                      ? 'border-[var(--purple)] bg-[var(--purple)]/15'
                      : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <p className={`text-sm font-medium ${aiPersonality === p.id ? 'text-[var(--purple)]' : 'text-[var(--text-primary)]'}`}>
                    {p.label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Assertiveness level</p>
              <span className="text-sm font-mono text-[var(--purple)]">{assertiveness}/4</span>
            </div>
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={assertiveness}
              onChange={e => setAssertiveness(Number(e.target.value))}
              className="w-full accent-[var(--purple)]"
            />
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>Suggestions only</span>
              <span>Strongly opinionated</span>
            </div>
          </div>
        </Section>

        {/* Canvas */}
        <Section title="Canvas">
          <Toggle value={autoSave} onChange={setAutoSave} label="Auto-save" />
          {autoSave && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Auto-save interval</span>
              <select
                value={autoSaveInterval}
                onChange={e => setAutoSaveInterval(Number(e.target.value))}
                className="bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[var(--purple)]"
              >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
              </select>
            </div>
          )}
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Toggle value={emailNotifications} onChange={setEmailNotifications} label="Email notifications" />
          <Toggle value={pushNotifications} onChange={setPushNotifications} label="Push notifications" />
          <Toggle value={soundEnabled} onChange={setSoundEnabled} label="Sound effects" />
        </Section>
      </div>
    </div>
  )
}
