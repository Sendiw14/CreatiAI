import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'

type FlagStatus = 'open' | 'reviewed' | 'dismissed' | 'actioned'

interface GovernanceFlag {
  id: string
  type: 'harmful_content' | 'hallucination' | 'bias' | 'copyright' | 'other'
  status: FlagStatus
  description: string
  projectId: string
  projectName: string
  userId: string
  userEmail: string
  aiResponse: string
  reportedAt: string
  reviewedBy?: string
}

interface Policy {
  id: string
  name: string
  description: string
  enabled: boolean
  severity: 'low' | 'medium' | 'high'
}

const MOCK_FLAGS: GovernanceFlag[] = [
  { id: '1', type: 'hallucination', status: 'open', description: 'AI generated factually incorrect statistics', projectId: 'p1', projectName: 'Marketing Brief', userId: 'u1', userEmail: 'alice@example.com', aiResponse: 'The market size is approximately $50 trillion globally...', reportedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', type: 'bias', status: 'open', description: 'Response shows demographic bias', projectId: 'p2', projectName: 'Brand Story', userId: 'u2', userEmail: 'bob@example.com', aiResponse: 'Target audience should primarily focus on...', reportedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', type: 'harmful_content', status: 'reviewed', description: 'Potentially manipulative persuasion tactics suggested', projectId: 'p3', projectName: 'Ad Campaign', userId: 'u3', userEmail: 'carol@example.com', aiResponse: 'To maximise conversions, exploit the fear of missing out by...', reportedAt: new Date(Date.now() - 86400000).toISOString(), reviewedBy: 'admin@creatiai.com' },
  { id: '4', type: 'copyright', status: 'dismissed', description: 'AI suggested text very similar to existing copy', projectId: 'p4', projectName: 'Product Page', userId: 'u4', userEmail: 'dave@example.com', aiResponse: 'Just do it. Think different. Be all you can be.', reportedAt: new Date(Date.now() - 172800000).toISOString(), reviewedBy: 'admin@creatiai.com' },
]

const MOCK_POLICIES: Policy[] = [
  { id: '1', name: 'Block harmful content', description: 'Prevent AI from generating harmful or dangerous content', enabled: true, severity: 'high' },
  { id: '2', name: 'Hallucination detection', description: 'Flag responses with unverified statistical claims', enabled: true, severity: 'medium' },
  { id: '3', name: 'Bias monitoring', description: 'Monitor for demographic and cultural bias in responses', enabled: true, severity: 'medium' },
  { id: '4', name: 'Copyright check', description: 'Flag responses that closely match known copyrighted content', enabled: false, severity: 'low' },
  { id: '5', name: 'Manipulation guardrails', description: 'Prevent dark pattern and manipulative tactic suggestions', enabled: true, severity: 'high' },
]

const FLAG_TYPE_LABELS: Record<GovernanceFlag['type'], string> = {
  harmful_content: 'Harmful content',
  hallucination: 'Hallucination',
  bias: 'Bias',
  copyright: 'Copyright',
  other: 'Other',
}

const STATUS_STYLES: Record<FlagStatus, string> = {
  open: 'bg-[var(--error)]/20 text-[var(--error)]',
  reviewed: 'bg-[var(--gold)]/20 text-[var(--gold)]',
  dismissed: 'bg-[var(--bg-elevated)] text-[var(--text-muted)]',
  actioned: 'bg-[var(--success)]/20 text-[var(--success)]',
}

export default function AdminGovernance() {
  const [activeTab, setActiveTab] = useState<'flags' | 'policies'>('flags')
  const [selectedFlag, setSelectedFlag] = useState<GovernanceFlag | null>(null)
  const [filterStatus, setFilterStatus] = useState<FlagStatus | 'all'>('all')
  const queryClient = useQueryClient()

  const { data: flags = MOCK_FLAGS } = useQuery({
    queryKey: ['admin', 'governance', 'flags'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/governance/flags')
        return res.data as GovernanceFlag[]
      } catch {
        return MOCK_FLAGS
      }
    },
  })

  const { data: policies = MOCK_POLICIES } = useQuery({
    queryKey: ['admin', 'governance', 'policies'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/governance/policies')
        return res.data as Policy[]
      } catch {
        return MOCK_POLICIES
      }
    },
  })

  const updateFlagMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: FlagStatus }) => {
      try {
        await api.patch(`/admin/governance/flags/${id}`, { status })
      } catch { /* offline mode */ }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'governance', 'flags'] }),
  })

  const togglePolicyMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      try {
        await api.patch(`/admin/governance/policies/${id}`, { enabled })
      } catch { /* offline mode */ }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'governance', 'policies'] }),
  })

  const filteredFlags = filterStatus === 'all' ? flags : flags.filter(f => f.status === filterStatus)
  const openCount = flags.filter(f => f.status === 'open').length

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime()
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`
    return `${Math.round(diff / 86400000)}d ago`
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">AI Governance</h1>
          <p className="text-[var(--text-secondary)] mt-2 text-lg">Content moderation and policy management</p>
        </div>
        {openCount > 0 && (
          <span className="px-4 py-2 rounded-xl bg-[var(--error)]/20 text-[var(--error)] text-sm font-bold border border-[var(--error)]/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            {openCount} open {openCount === 1 ? 'flag' : 'flags'}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-black/20 backdrop-blur-md rounded-2xl w-fit mb-8 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        {(['flags', 'policies'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === tab
                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'flags' ? 'Flagged content' : 'Policies'}
          </button>
        ))}
      </div>

      {activeTab === 'flags' && (
        <div className="grid md:grid-cols-5 gap-8">
          {/* Flags list */}
          <div className="md:col-span-2 space-y-4">
            {/* Filter */}
            <div className="flex gap-2 flex-wrap mb-2">
              {(['all', 'open', 'reviewed', 'actioned', 'dismissed'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                    filterStatus === s
                      ? 'bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border-transparent'
                      : 'bg-black/20 border border-white/10 text-[var(--text-muted)] hover:text-white hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {filteredFlags.map(flag => (
              <motion.div
                key={flag.id}
                layoutId={`flag-${flag.id}`}
                onClick={() => setSelectedFlag(flag)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 group ${
                  selectedFlag?.id === flag.id
                    ? 'border-[var(--purple)] bg-[var(--purple)]/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                    : 'border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider group-hover:text-[var(--text-secondary)] transition-colors">{FLAG_TYPE_LABELS[flag.type]}</span>
                  <span className={`text-xs px-3 py-1 rounded-lg font-bold border border-current/20 ${STATUS_STYLES[flag.status]}`}>
                    {flag.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-white/90 leading-relaxed mb-4 line-clamp-2 group-hover:text-white transition-colors">{flag.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-muted)]">{flag.userEmail}</span>
                  <span className="text-xs font-bold text-[var(--text-muted)]">{formatTime(flag.reportedAt)}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail panel */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {selectedFlag ? (
                <motion.div
                  key={selectedFlag.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--purple)] to-transparent opacity-50" />
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="text-sm font-bold text-[var(--purple)] uppercase tracking-wider drop-shadow-sm">{FLAG_TYPE_LABELS[selectedFlag.type]}</span>
                      <h3 className="text-xl font-display font-bold text-white mt-2 leading-tight">{selectedFlag.description}</h3>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-lg font-bold border border-current/20 ${STATUS_STYLES[selectedFlag.status]}`}>
                      {selectedFlag.status}
                    </span>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                        <p className="text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Project</p>
                        <p className="text-sm font-medium text-white/90">{selectedFlag.projectName}</p>
                      </div>
                      <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                        <p className="text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Reported by</p>
                        <p className="text-sm font-medium text-white/90">{selectedFlag.userEmail}</p>
                      </div>
                    </div>
                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                      <p className="text-xs font-bold text-[var(--text-muted)] mb-3 uppercase tracking-wider">AI response excerpt</p>
                      <blockquote className="text-sm font-medium text-[var(--text-secondary)] bg-white/5 border-l-4 border-[var(--purple)] px-4 py-3 rounded-r-xl italic shadow-inner">
                        "{selectedFlag.aiResponse}"
                      </blockquote>
                    </div>
                    {selectedFlag.reviewedBy && (
                      <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                        <p className="text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Reviewed by</p>
                        <p className="text-sm font-medium text-white/90">{selectedFlag.reviewedBy}</p>
                      </div>
                    )}
                  </div>

                  {selectedFlag.status === 'open' && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => updateFlagMutation.mutate({ id: selectedFlag.id, status: 'actioned' })}
                        className="flex-1 py-3 rounded-xl text-sm bg-[var(--error)]/20 text-[var(--error)] hover:bg-[var(--error)]/30 transition-all duration-300 font-bold border border-[var(--error)]/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                      >
                        Take action
                      </button>
                      <button
                        onClick={() => updateFlagMutation.mutate({ id: selectedFlag.id, status: 'reviewed' })}
                        className="flex-1 py-3 rounded-xl text-sm bg-[var(--gold)]/20 text-[var(--gold)] hover:bg-[var(--gold)]/30 transition-all duration-300 font-bold border border-[var(--gold)]/30 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                      >
                        Mark reviewed
                      </button>
                      <button
                        onClick={() => { updateFlagMutation.mutate({ id: selectedFlag.id, status: 'dismissed' }); setSelectedFlag(null) }}
                        className="flex-1 py-3 rounded-xl text-sm border border-white/10 text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all duration-300 font-bold"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 flex items-center justify-center bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 border-dashed shadow-inner"
                >
                  <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Select a flag to review</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-4 max-w-3xl">
          {policies.map(policy => (
            <div
              key={policy.id}
              className="flex items-center gap-6 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:border-white/20 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-base font-bold text-white drop-shadow-sm">{policy.name}</p>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border border-current/20 ${
                    policy.severity === 'high' ? 'bg-[var(--error)]/20 text-[var(--error)]' :
                    policy.severity === 'medium' ? 'bg-[var(--gold)]/20 text-[var(--gold)]' :
                    'bg-white/10 text-[var(--text-muted)]'
                  }`}>
                    {policy.severity}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-white/90 transition-colors">{policy.description}</p>
              </div>
              <button
                onClick={() => togglePolicyMutation.mutate({ id: policy.id, enabled: !policy.enabled })}
                className={`relative w-12 rounded-full transition-all duration-300 shrink-0 shadow-inner border border-white/10`}
                style={{ height: '26px', background: policy.enabled ? 'var(--purple)' : 'rgba(0,0,0,0.4)' }}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-md ${
                    policy.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
