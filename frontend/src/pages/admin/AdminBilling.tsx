import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'

interface PlanTier {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  activeSubscribers: number
  mrr: number
  color: string
}

interface Subscription {
  id: string
  userId: string
  userEmail: string
  displayName: string
  plan: string
  status: 'active' | 'past_due' | 'canceled' | 'trialing'
  currentPeriodEnd: string
  amount: number
}

interface RevenuePoint {
  month: string
  mrr: number
  newMrr: number
  churn: number
}

const MOCK_PLANS: PlanTier[] = [
  { id: 'free', name: 'Free', price: 0, interval: 'month', features: ['5 projects', '100 AI interactions/mo', '1 collaborator', 'Community support'], activeSubscribers: 891, mrr: 0, color: 'var(--text-muted)' },
  { id: 'pro', name: 'Pro', price: 19, interval: 'month', features: ['Unlimited projects', '2,000 AI interactions/mo', '5 collaborators', 'Priority support', 'Session replay', 'Export all formats'], activeSubscribers: 243, mrr: 4617, color: 'var(--purple)' },
  { id: 'team', name: 'Team', price: 49, interval: 'month', features: ['Everything in Pro', '10,000 AI interactions/mo', 'Unlimited collaborators', 'Team analytics', 'Custom AI personality', 'SSO'], activeSubscribers: 87, mrr: 4263, color: 'var(--cyan)' },
  { id: 'enterprise', name: 'Enterprise', price: 199, interval: 'month', features: ['Everything in Team', 'Unlimited AI interactions', 'Dedicated support', 'SLA guarantee', 'Custom contract', 'On-premise option'], activeSubscribers: 26, mrr: 5174, color: 'var(--gold)' },
]

const MOCK_REVENUE: RevenuePoint[] = [
  { month: 'Aug', mrr: 7200, newMrr: 1800, churn: 420 },
  { month: 'Sep', mrr: 8540, newMrr: 2100, churn: 760 },
  { month: 'Oct', mrr: 9890, newMrr: 2340, churn: 990 },
  { month: 'Nov', mrr: 11200, newMrr: 2560, churn: 1250 },
  { month: 'Dec', mrr: 12800, newMrr: 2900, churn: 1300 },
  { month: 'Jan', mrr: 14054, newMrr: 3210, churn: 1956 },
]

const MOCK_SUBS: Subscription[] = [
  { id: 's1', userId: 'u1', userEmail: 'alice@example.com', displayName: 'Alice Chen', plan: 'pro', status: 'active', currentPeriodEnd: new Date(Date.now() + 15 * 86400000).toISOString(), amount: 19 },
  { id: 's2', userId: 'u2', userEmail: 'eve@example.com', displayName: 'Eve Johnson', plan: 'enterprise', status: 'active', currentPeriodEnd: new Date(Date.now() + 22 * 86400000).toISOString(), amount: 199 },
  { id: 's3', userId: 'u3', userEmail: 'carol@example.com', displayName: 'Carol Lee', plan: 'team', status: 'trialing', currentPeriodEnd: new Date(Date.now() + 7 * 86400000).toISOString(), amount: 49 },
  { id: 's4', userId: 'u4', userEmail: 'frank@example.com', displayName: 'Frank Wilson', plan: 'pro', status: 'past_due', currentPeriodEnd: new Date(Date.now() - 2 * 86400000).toISOString(), amount: 19 },
]

const STATUS_STYLES: Record<Subscription['status'], string> = {
  active: 'bg-[var(--success)]/20 text-[var(--success)]',
  trialing: 'bg-[var(--cyan)]/20 text-[var(--cyan)]',
  past_due: 'bg-[var(--error)]/20 text-[var(--error)]',
  canceled: 'bg-[var(--bg-surface)] text-[var(--text-muted)]',
}

export default function AdminBilling() {
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'plans'>('overview')

  const { data: plans = MOCK_PLANS } = useQuery({
    queryKey: ['admin', 'billing', 'plans'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/billing/plans')
        return res.data as PlanTier[]
      } catch {
        return MOCK_PLANS
      }
    },
  })

  const { data: revenue = MOCK_REVENUE } = useQuery({
    queryKey: ['admin', 'billing', 'revenue'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/billing/revenue')
        return res.data as RevenuePoint[]
      } catch {
        return MOCK_REVENUE
      }
    },
  })

  const { data: subscriptions = MOCK_SUBS } = useQuery({
    queryKey: ['admin', 'billing', 'subscriptions'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/billing/subscriptions')
        return res.data as Subscription[]
      } catch {
        return MOCK_SUBS
      }
    },
  })

  const totalMrr = plans.reduce((s, p) => s + p.mrr, 0)
  const totalSubs = plans.reduce((s, p) => s + p.activeSubscribers, 0)
  const maxRevenue = Math.max(...revenue.map(r => r.mrr))

  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Billing</h1>
          <p className="text-[var(--text-secondary)] mt-2 text-lg">Subscription plans and revenue metrics</p>
        </div>
        <div className="text-right bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Total MRR</p>
          <p className="text-3xl font-display font-bold text-[var(--success)] drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">${totalMrr.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-black/20 backdrop-blur-md rounded-2xl w-fit mb-8 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        {(['overview', 'subscriptions', 'plans'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === tab
                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI row */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: 'MRR', value: `$${totalMrr.toLocaleString()}`, sub: '+12% MoM', color: 'var(--success)' },
              { label: 'ARR (est.)', value: `$${(totalMrr * 12).toLocaleString()}`, sub: 'Annualised', color: 'var(--cyan)' },
              { label: 'Paid subscribers', value: (totalSubs - (plans.find(p => p.id === 'free')?.activeSubscribers ?? 0)).toLocaleString(), sub: `of ${totalSubs} total`, color: 'var(--purple)' },
              { label: 'Avg revenue / user', value: `$${(totalMrr / Math.max(1, totalSubs - (plans.find(p => p.id === 'free')?.activeSubscribers ?? 0))).toFixed(2)}`, sub: 'ARPU', color: 'var(--gold)' },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group hover:border-white/20 transition-colors"
              >
                <div className="absolute top-0 left-0 w-full h-1 opacity-50" style={{ background: `linear-gradient(to right, ${kpi.color}, transparent)` }} />
                <p className="text-xs font-bold text-[var(--text-muted)] mb-3 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-3xl font-display font-bold drop-shadow-md" style={{ color: kpi.color }}>{kpi.value}</p>
                <p className="text-sm font-medium text-[var(--text-secondary)] mt-2">{kpi.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Revenue chart */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--purple)] via-[var(--cyan)] to-transparent opacity-50" />
            <h3 className="font-display font-bold text-xl text-white mb-8">MRR growth</h3>
            <div className="flex items-end gap-4 h-64">
              {revenue.map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full">
                  <div className="w-full flex flex-col items-center gap-0.5 relative h-full">
                    {/* Stacked: churn negative indicator, MRR bar */}
                    <div className="w-full flex items-end h-full">
                      <div
                        className="w-full rounded-t-md transition-all duration-500 cursor-pointer group-hover:opacity-100 relative overflow-hidden"
                        style={{
                          height: `${(point.mrr / maxRevenue) * 100}%`,
                          background: `linear-gradient(to top, var(--purple), var(--cyan))`,
                          opacity: 0.6,
                          minHeight: '4px',
                        }}
                        title={`MRR: $${point.mrr.toLocaleString()}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent -translate-y-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      </div>
                    </div>
                    <div className="absolute -top-10 bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10 shadow-[0_10px_20px_rgba(0,0,0,0.5)] translate-y-2 group-hover:translate-y-0">
                      ${point.mrr.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-white transition-colors">{point.month}</span>
                  <span className="text-xs font-mono font-bold text-[var(--cyan)] drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">${(point.mrr / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plan breakdown */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--cyan)] to-transparent opacity-50" />
            <h3 className="font-display font-bold text-xl text-white mb-6">Revenue by plan</h3>
            <div className="space-y-5">
              {plans.filter(p => p.mrr > 0).map((plan, i) => (
                <div key={plan.id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold drop-shadow-sm" style={{ color: plan.color }}>{plan.name}</span>
                    <div className="text-right">
                      <span className="text-sm text-white font-mono font-bold">${plan.mrr.toLocaleString()}/mo</span>
                      <span className="text-xs text-[var(--text-muted)] ml-2 font-medium">{plan.activeSubscribers} subs</span>
                    </div>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full relative overflow-hidden"
                      style={{ width: `${(plan.mrr / totalMrr) * 100}%`, background: plan.color, opacity: 0.9 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 0.1}s` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--purple)] via-[var(--cyan)] to-transparent opacity-50" />
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                {['Subscriber', 'Plan', 'Status', 'Amount', 'Renews'].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{sub.displayName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{sub.userEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[var(--text-secondary)] capitalize group-hover:text-white transition-colors">{sub.plan}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-lg font-bold border border-current/20 ${STATUS_STYLES[sub.status]}`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-bold text-[var(--text-secondary)] group-hover:text-white transition-colors">${sub.amount}/mo</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">{formatDate(sub.currentPeriodEnd)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="grid md:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-1 opacity-50" style={{ background: `linear-gradient(to right, ${plan.color}, transparent)` }} />
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-bold text-lg drop-shadow-sm" style={{ color: plan.color }}>{plan.name}</span>
                <span className="text-xs font-bold text-[var(--text-muted)] bg-black/20 border border-white/10 px-3 py-1 rounded-lg">
                  {plan.activeSubscribers} users
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold text-white drop-shadow-md">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                </span>
                {plan.price > 0 && <span className="text-sm font-medium text-[var(--text-muted)]">/mo</span>}
              </div>
              {plan.mrr > 0 && (
                <p className="text-sm text-[var(--success)] font-bold mb-6 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">${plan.mrr.toLocaleString()} MRR</p>
              )}
              <ul className="space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm font-medium text-[var(--text-secondary)] group-hover:text-white/90 transition-colors">
                    <span className="mt-0.5 drop-shadow-sm" style={{ color: plan.color }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
