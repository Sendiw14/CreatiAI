import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { ConfidenceBadge } from '../../ui/ConfidenceBadge';
import { useAIStore } from '../../../stores/aiStore';
import type { ConfidenceLevel } from '../../../types';

interface AINodeData {
  type: string;
  content: string;
  label?: string;
  confidence?: ConfidenceLevel;
  responseId?: string;
  isStreaming?: boolean;
  sources?: string[];
  createdBy?: string;
  createdAt?: string;
}

export default function AIGeneratedNode({ data, selected }: NodeProps<AINodeData>) {
  const { branchResponse, challengeResponse } = useAIStore();

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative min-w-[260px] max-w-[420px] rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
        selected
          ? 'border-[var(--gold)] shadow-[0_0_40px_rgba(255,215,0,0.2)] bg-[var(--bg-card)]/95'
          : 'border-[var(--gold)]/30 bg-[var(--bg-card)]/80 hover:border-[var(--gold)]/60 hover:shadow-[0_8px_30px_rgba(255,215,0,0.1)]'
      }`}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--gold)]/5 to-transparent pointer-events-none" />
      
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--gold)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[var(--gold)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="target" position={Position.Left} id="left" className="!w-3 !h-3 !bg-[var(--gold)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-[var(--gold)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />

      {/* Header */}
      <div className="relative flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--gold)]/20 bg-gradient-to-r from-[var(--gold)]/10 to-transparent rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-[var(--gold)]/20 flex items-center justify-center border border-[var(--gold)]/30 shadow-[0_0_10px_rgba(255,215,0,0.2)]">
            <span className="text-xs text-[var(--gold)]">✦</span>
          </div>
          <span className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--gold)]">AI Generated</span>
        </div>
        {data.confidence && <ConfidenceBadge level={data.confidence} size="sm" />}
      </div>

      {/* Content */}
      <div className="relative p-4 nodrag">
        {data.isStreaming ? (
          <div className="flex items-center gap-3 p-2">
            <div className="flex gap-1">
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
            </div>
            <span className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--gold)] animate-pulse">Synthesizing…</span>
          </div>
        ) : (
          <p className="font-body text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
            {data.content}
          </p>
        )}
      </div>

      {/* Sources */}
      {data.sources && data.sources.length > 0 && (
        <div className="relative px-4 pb-3 flex flex-wrap gap-2">
          {data.sources.map((src, i) => (
            <span key={i} className="px-2.5 py-1 rounded-md bg-[var(--bg-input)] border border-[var(--border)] font-mono text-[10px] text-[var(--text-secondary)] hover:border-[var(--gold)]/40 transition-colors cursor-pointer">
              {src}
            </span>
          ))}
        </div>
      )}

      {/* Action row */}
      {data.responseId && !data.isStreaming && (
        <div className="relative flex items-center gap-2 px-4 pb-4 pt-2 nodrag border-t border-[var(--border)]/30 mt-1">
          <button
            onClick={() => branchResponse(data.responseId!)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-display font-bold tracking-wide text-[var(--text-secondary)] bg-[var(--bg-input)] hover:bg-[var(--cyan)]/10 hover:text-[var(--cyan)] border border-transparent hover:border-[var(--cyan)]/30 transition-all"
            title="Branch this idea"
          >
            <span className="text-[14px]">⎇</span> Branch
          </button>
          <button
            onClick={() => challengeResponse(data.responseId!)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-display font-bold tracking-wide text-[var(--text-secondary)] bg-[var(--bg-input)] hover:bg-[var(--gold)]/10 hover:text-[var(--gold)] border border-transparent hover:border-[var(--gold)]/30 transition-all"
            title="Challenge this idea"
          >
            <span className="text-[14px]">⚡</span> Challenge
          </button>
        </div>
      )}
    </motion.div>
  );
}
