import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightElement, hint, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-display font-medium text-[var(--text-secondary)] tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center group">
          {leftIcon && (
            <span className="absolute left-4 text-[var(--text-muted)] flex items-center group-focus-within:text-[var(--purple)] transition-colors">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full h-12 rounded-xl bg-[var(--bg-card)]/40 backdrop-blur-xl border text-[var(--text-primary)]',
              'font-body text-sm placeholder:text-[var(--text-muted)]',
              'transition-all duration-300 outline-none shadow-sm',
              'focus:bg-[var(--bg-card)]/60 focus:border-[var(--purple)]/50 focus:ring-2 focus:ring-[var(--purple)]/20 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)]',
              'hover:border-white/20',
              leftIcon ? 'pl-11' : 'pl-4',
              rightElement ? 'pr-11' : 'pr-4',
              error
                ? 'border-[var(--error)]/50 focus:border-[var(--error)] focus:ring-[var(--error)]/20 focus:shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                : 'border-white/10',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-4 flex items-center">{rightElement}</span>
          )}
        </div>
        {error && (
          <span
            id={`${inputId}-error`}
            className="text-[var(--error)] text-xs font-body flex items-center gap-1.5 mt-0.5"
            role="alert"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${inputId}-hint`} className="text-[var(--text-muted)] text-xs font-body mt-0.5">
            {hint}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoResize?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, autoResize, className, id, onChange, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2)}`;
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && combinedRef.current) {
        combinedRef.current.style.height = 'auto';
        combinedRef.current.style.height = `${combinedRef.current.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-display font-medium text-[var(--text-secondary)] tracking-wide"
          >
            {label}
          </label>
        )}
        <textarea
          ref={combinedRef}
          id={textareaId}
          onChange={handleChange}
          className={clsx(
            'w-full rounded-xl bg-[var(--bg-card)]/40 backdrop-blur-xl border text-[var(--text-primary)]',
            'font-body text-sm placeholder:text-[var(--text-muted)] px-4 py-3',
            'transition-all duration-300 outline-none resize-none shadow-sm',
            'focus:bg-[var(--bg-card)]/60 focus:border-[var(--purple)]/50 focus:ring-2 focus:ring-[var(--purple)]/20 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)]',
            'hover:border-white/20',
            error ? 'border-[var(--error)]/50 focus:border-[var(--error)] focus:ring-[var(--error)]/20 focus:shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/10',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <span className="text-[var(--error)] text-xs font-body flex items-center gap-1.5 mt-0.5" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </span>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
