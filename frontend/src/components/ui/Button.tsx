import type React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

type SafeHTMLButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrag' | 'onDragEnd' | 'onDragStart' | 'onDragEnter' | 'onDragExit' |
  'onDragLeave' | 'onDragOver' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
>;

interface ButtonProps extends SafeHTMLButtonProps {
  variant?: 'gradient' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'gradient',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  fullWidth,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-display font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)]/50 disabled:opacity-40 disabled:pointer-events-none relative overflow-hidden group';

  const variants: Record<string, string> = {
    gradient: 'bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-[1.02] border border-white/10',
    ghost: 'bg-white/5 hover:bg-white/10 text-[var(--text-primary)] border border-white/5 hover:border-white/20 backdrop-blur-md',
    danger: 'bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] hover:bg-[var(--error)]/20 hover:border-[var(--error)]/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] backdrop-blur-md',
    gold: 'bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-[var(--gold)] hover:bg-[var(--gold)]/20 hover:border-[var(--gold)]/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-md',
  };

  const sizes: Record<string, string> = {
    sm: 'h-9 px-4 text-xs rounded-lg',
    md: 'h-12 px-6 text-sm rounded-xl',
    lg: 'h-14 px-8 text-base rounded-2xl',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...(props as Record<string, unknown>)}
    >
      {/* Shine effect for gradient variant */}
      {variant === 'gradient' && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
      )}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading…</span>
          </motion.span>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            {leftIcon}
            {children}
            {rightIcon}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
