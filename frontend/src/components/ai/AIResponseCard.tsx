import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';
import { useAIStore } from '../../stores/aiStore';
import { useCanvasStore } from '../../stores/canvasStore';
import type { AIResponse } from '../../types';

interface Props {
  response: AIResponse;
}

const PHASE_LABELS = ['Mapping', 'Analyzing', 'Critiquing', 'Refining', 'Synthesizing'];

export default function AIResponseCard({ response }: Props) {
  const { submitFeedback, branchResponse, challengeResponse } = useAIStore();
  const { addNode } = useCanvasStore();
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const handleAddToCanvas = () => {
    addNode({
      id: `ai-${response.id}`,
      type: 'ai_generated',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      title: 'AI Response',
      content: response.text,
      aiGenerated: true,
      data: {
        confidence: response.confidenceLevel,
        responseId: response.id,
        sources: response.influences?.map((i) => i.label),
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="rounded-3xl border border-white/10 bg-[var(--bg-card)]/40 backdrop-blur-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:border-[var(--purple)]/30 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.2)] transition-all duration-500 group"
    >
      {/* Self-critique phase indicator */}
      {response.selfCritique && (
        <div className="px-6 pt-5">
          <div className="flex items-center gap-2">
            {PHASE_LABELS.map((_label, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full transition-colors bg-[var(--gold)] shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse`} style={{ animationDelay: `${i * 150}ms` }} />
                {i < 4 && <div className="w-4 h-px bg-white/10" />}
              </div>
            ))}
            <span className="ml-3 font-mono font-bold tracking-widest uppercase text-[10px] text-[var(--text-muted)] bg-white/5 px-2 py-1 rounded-md border border-white/5">Analyzed</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="px-6 pt-5 pb-4">
        <p className={`font-body text-sm text-[var(--text-primary)] leading-relaxed ${
          !expanded && response.text.length > 300 ? 'line-clamp-5' : ''
        }`}>
          {response.text}
        </p>
        {response.text.length > 300 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 font-display font-bold text-xs text-[var(--purple)] hover:text-[var(--cyan)] transition-colors uppercase tracking-widest flex items-center gap-1"
          >
            {expanded ? 'show less' : 'show more'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        )}
      </div>

      {/* Confidence + metadata */}
      <div className="flex items-center gap-4 px-6 pb-4">
        {response.confidenceLevel && <ConfidenceBadge level={response.confidenceLevel} size="sm" />}
        {response.confidenceLevel && (
          <span className="font-mono font-bold tracking-widest uppercase text-[10px] text-[var(--text-muted)] bg-white/5 px-2 py-1 rounded-md border border-white/5">
            score: {Math.round(response.confidenceScore * 100)}%
          </span>
        )}
      </div>

      {/* Influences (collapsible) */}
      {response.influences && response.influences.length > 0 && (
        <div className="px-6 pb-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 font-display font-bold text-xs text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors uppercase tracking-widest"
          >
            <span className={`text-[10px] transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}>▸</span>
            <span>{response.influences.length} influence{response.influences.length !== 1 ? 's' : ''}</span>
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 space-y-3 overflow-hidden"
              >
                {response.influences.map((inf, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="w-2 h-2 rounded-full bg-[var(--cyan)] mt-1.5 shrink-0 shadow-[0_0_10px_rgba(8,145,178,0.5)] group-hover:scale-150 transition-transform" />
                    <div>
                      <span className="font-mono font-bold tracking-widest uppercase text-[10px] text-[var(--cyan)]">{inf.label}</span>
                      <p className="font-body text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{inf.value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Alternatives */}
      {response.alternatives && response.alternatives.length > 0 && (
        <div className="px-6 pb-4">
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="flex items-center gap-2 font-display font-bold text-xs text-[var(--text-muted)] hover:text-[var(--purple)] transition-colors uppercase tracking-widest"
          >
            <span className={`text-[10px] transition-transform duration-300 ${showAlternatives ? 'rotate-90' : ''}`}>▸</span>
            <span>{response.alternatives.length} alternative{response.alternatives.length !== 1 ? 's' : ''}</span>
          </button>
          <AnimatePresence>
            {showAlternatives && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 space-y-3 overflow-hidden"
              >
                {response.alternatives.map((alt, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-white/10 bg-white/5 shadow-inner hover:bg-white/10 transition-colors">
                    <p className="font-body text-sm text-[var(--text-secondary)] leading-relaxed">{alt.text}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-2 px-4 pb-4 pt-3 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <button
          onClick={handleAddToCanvas}
          title="Add to canvas"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display font-bold text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--cyan)] transition-all uppercase tracking-widest border border-transparent hover:border-white/10"
        >
          <span className="text-base">+</span> Canvas
        </button>
        <button
          onClick={() => branchResponse(response.id)}
          title="Branch this response"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display font-bold text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--purple)] transition-all uppercase tracking-widest border border-transparent hover:border-white/10"
        >
          <span className="text-base">⎇</span> Branch
        </button>
        <button
          onClick={() => challengeResponse(response.id)}
          title="Challenge this response"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display font-bold text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--gold)] transition-all uppercase tracking-widest border border-transparent hover:border-white/10"
        >
          <span className="text-base">⚡</span> Challenge
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              setFeedback('up');
              submitFeedback(response.id, 'up');
            }}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              feedback === 'up' ? 'text-[var(--success)] bg-[var(--success)]/10 border border-[var(--success)]/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] scale-110' : 'text-[var(--text-muted)] hover:text-[var(--success)] hover:bg-white/10 border border-transparent'
            }`}
            aria-label="Helpful"
          >
            👍
          </button>
          <button
            onClick={() => {
              setFeedback('down');
              submitFeedback(response.id, 'down');
            }}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              feedback === 'down' ? 'text-[var(--error)] bg-[var(--error)]/10 border border-[var(--error)]/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] scale-110' : 'text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-white/10 border border-transparent'
            }`}
            aria-label="Not helpful"
          >
            👎
          </button>
        </div>
      </div>
    </motion.div>
  );
}
