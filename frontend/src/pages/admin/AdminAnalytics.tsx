import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'

interface DataPoint {
  label: string
  value: number
}

interface AnalyticsData {
  dau: DataPoint[]
  mau: DataPoint[]
  aiUsage: DataPoint[]
  topFeatures: { feature: string; count: number; percentage: number }[]
  retentionCohort: number[][]
}

const MOCK_ANALYTICS: AnalyticsData = {
  dau: Array.from({ length: 30 }, (_, i) => ({
    label: `Day ${i + 1}`,
    value: Math.floor(200 + Math.sin(i * 0.5) * 80 + Math.random() * 40),
  })),
  mau: Array.from({ length: 12 }, (_, i) => ({
    label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: Math.floor(800 + i * 120 + Math.random() * 100),
  })),
  aiUsage: Array.from({ length: 7 }, (_, i) => ({
    label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    value: Math.floor(1000 + Math.random() * 2000),
  })),
  topFeatures: [
    { feature: 'AI Co-Creator', count: 18234, percentage: 85 },
    { feature: 'Canvas text nodes', count: 12841, percentage: 60 },
    { feature: 'What-If mode', count: 8923, percentage: 42 },
    { feature: 'Collaboration', count: 5621, percentage: 26 },
    { feature: 'Sketch nodes', count: 4102, percentage: 19 },
    { feature: 'Image nodes', count: 3891, percentage: 18 },
    { feature: 'Session replay', count: 2341, percentage: 11 },
  ],
  retentionCohort: Array.from({ length: 6 }, () =>
    Array.from({ length: 8 }, (_, j) => Math.max(10, Math.floor(100 - j * 12 + Math.random() * 10)))
  ),
}

type TimeRange = '7d' | '30d' | '90d' | '1y'

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [activeChart, setActiveChart] = useState<'dau' | 'mau' | 'ai'>('dau')

  const { data: analytics = MOCK_ANALYTICS } = useQuery({
    queryKey: ['admin', 'analytics', timeRange],
    queryFn: async () => {
      try {
        const res = await api.get(`/admin/analytics?range=${timeRange}`)
        return res.data as AnalyticsData
      } catch {
        return MOCK_ANALYTICS
      }
    },
  })

  const chartData = activeChart === 'dau' ? analytics.dau : activeChart === 'mau' ? analytics.mau : analytics.aiUsage
  const maxVal = Math.max(...chartData.map(d => d.value))

  const retentionColor = (value: number) => {
    if (value > 70) return 'bg-[var(--success)]/80'
    if (value > 50) return 'bg-[var(--cyan)]/60'
    if (value > 30) return 'bg-[var(--purple)]/50'
    if (value > 15) return 'bg-[var(--gold)]/40'
    return 'bg-[var(--bg-elevated)]'
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-base text-[var(--text-secondary)] mt-2">Platform usage metrics and trends</p>
        </div>
        <div className="flex gap-2 bg-black/20 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          {(['7d', '30d', '90d', '1y'] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                timeRange === r
                  ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--purple)] via-[var(--cyan)] to-transparent opacity-50" />
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2 bg-black/20 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
            {[
              { id: 'dau', label: 'Daily Active Users' },
              { id: 'mau', label: 'Monthly Active' },
              { id: 'ai', label: 'AI Interactions' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setActiveChart(c.id as typeof activeChart)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeChart === c.id
                    ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <span className="text-sm font-mono font-bold text-[var(--text-muted)] bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            Avg: <span className="text-white">{Math.round(chartData.reduce((s, d) => s + d.value, 0) / chartData.length).toLocaleString()}</span>
          </span>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-2 h-64 mt-8">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full">
              <div className="relative w-full flex items-end justify-center h-full">
                <div
                  className="w-full rounded-t-md transition-all duration-500 cursor-pointer group-hover:opacity-100 relative overflow-hidden"
                  style={{
                    height: `${(d.value / maxVal) * 100}%`,
                    background: `linear-gradient(to top, var(--purple), var(--cyan))`,
                    opacity: 0.6,
                    minHeight: '4px',
                  }}
                  title={`${d.label}: ${d.value.toLocaleString()}`}
                >
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent -translate-y-full group-hover:animate-[shimmer_1.5s_infinite]" />
                </div>
                <div className="absolute -top-10 bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10 shadow-[0_10px_20px_rgba(0,0,0,0.5)] translate-y-2 group-hover:translate-y-0">
                  {d.value.toLocaleString()}
                </div>
              </div>
              {chartData.length <= 12 && (
                <span className="text-xs font-medium text-[var(--text-muted)] truncate w-full text-center group-hover:text-white transition-colors">{d.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Feature usage */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--purple)] to-transparent opacity-50" />
          <h3 className="font-display font-bold text-xl text-white mb-6">Top features</h3>
          <div className="space-y-5">
            {analytics.topFeatures.map((f, i) => (
              <div key={f.feature} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{f.feature}</span>
                  <span className="text-xs font-mono font-bold text-[var(--text-muted)] group-hover:text-[var(--cyan)] transition-colors">{f.count.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                      width: `${f.percentage}%`,
                      background: 'linear-gradient(to right, var(--purple), var(--cyan))',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 0.1}s` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retention cohort */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--cyan)] to-transparent opacity-50" />
          <h3 className="font-display font-bold text-xl text-white mb-2">Retention cohort</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">Weekly retention by signup cohort</p>
          <div className="space-y-1.5">
            {analytics.retentionCohort.map((row, ri) => (
              <div key={ri} className="flex gap-1.5 items-center group">
                <span className="text-xs font-medium text-[var(--text-muted)] w-14 shrink-0 group-hover:text-white transition-colors">Week {ri + 1}</span>
                {row.map((val, ci) => (
                  <div
                    key={ci}
                    className={`flex-1 h-8 rounded-md flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 hover:scale-110 hover:z-10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer ${retentionColor(val)}`}
                    title={`${val}%`}
                  >
                    <span className="text-white/90 drop-shadow-md">{val}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 items-center mt-3">
            <span className="text-xs text-[var(--text-muted)] w-14 shrink-0" />
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className="flex-1 text-center text-xs font-bold text-[var(--text-muted)]">W{i + 1}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
