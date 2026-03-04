import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ConfidenceLevel } from '../../types';

interface Props {
  level: ConfidenceLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const labels: Record<ConfidenceLevel, string> = {
  high: 'HIGH',
  medium: 'MED',
  low: 'LOW',
  speculative: 'SPEC',
};

const colorClass: Record<ConfidenceLevel, string> = {
  high: 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
  medium: 'bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
  low: 'bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
  speculative: 'bg-[var(--purple)]/10 text-[var(--purple)] border border-[var(--purple)]/30 shadow-[0_0_10px_rgba(139,92,246,0.1)]',
};

const sizeClass: Record<string, string> = {
  sm: 'text-[10px] h-5 px-2 rounded-md',
  md: 'text-[11px] h-6 px-2.5 rounded-lg',
  lg: 'text-[12px] h-7 px-3 rounded-xl',
};

export function ConfidenceBadge({
  level,
  score,
  size = 'md',
  animated = false,
  className,
}: Props) {
  return (
    <motion.span
      initial={animated ? { scale: 0.8, opacity: 0, y: 5 } : false}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={clsx(
        'inline-flex items-center gap-1.5 font-display font-semibold tracking-wider uppercase backdrop-blur-md',
        colorClass[level],
        sizeClass[size],
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className={clsx(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          level === 'high' ? 'bg-[var(--success)]' :
          level === 'medium' ? 'bg-[var(--gold)]' :
          level === 'low' ? 'bg-[var(--error)]' :
          'bg-[var(--purple)]'
        )}></span>
        <span className={clsx(
          "relative inline-flex rounded-full h-1.5 w-1.5",
          level === 'high' ? 'bg-[var(--success)]' :
          level === 'medium' ? 'bg-[var(--gold)]' :
          level === 'low' ? 'bg-[var(--error)]' :
          'bg-[var(--purple)]'
        )}></span>
      </span>
      {labels[level]}
      {score !== undefined && (
        <span className="opacity-70 font-mono ml-0.5">· {score}</span>
      )}
    </motion.span>
  );
}
