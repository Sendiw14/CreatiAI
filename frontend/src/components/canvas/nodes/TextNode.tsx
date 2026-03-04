import { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';

interface TextNodeData {
  content?: string;
  label?: string;
  title?: string;
  [key: string]: unknown;
}

export default function TextNode({ data, selected }: NodeProps<TextNodeData>) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(data.content || '');

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative min-w-[220px] max-w-[360px] rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
        selected
          ? 'border-[var(--purple)] shadow-[0_0_30px_rgba(123,97,255,0.2)] bg-[var(--bg-card)]/90'
          : 'border-[var(--border)] bg-[var(--bg-card)]/60 hover:border-[var(--purple)]/50 hover:bg-[var(--bg-card)]/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--purple)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[var(--purple)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="target" position={Position.Left} id="left" className="!w-3 !h-3 !bg-[var(--purple)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-[var(--purple)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]/50 bg-gradient-to-r from-[var(--bg-card)] to-transparent rounded-t-2xl">
        <div className="w-6 h-6 rounded-lg bg-[var(--purple)]/10 flex items-center justify-center border border-[var(--purple)]/20">
          <span className="text-xs text-[var(--purple)]">📝</span>
        </div>
        <span className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-secondary)]">{data.label || 'Text Note'}</span>
      </div>

      {/* Content */}
      <div className="p-4 nodrag">
        {editing ? (
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => setEditing(false)}
            placeholder="Type your idea…"
            rows={3}
            className="w-full bg-transparent resize-none font-body text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none leading-relaxed"
          />
        ) : (
          <div
            onDoubleClick={() => setEditing(true)}
            className="font-body text-sm text-[var(--text-primary)] min-h-[48px] cursor-text whitespace-pre-wrap leading-relaxed"
          >
            {content || <span className="text-[var(--text-muted)] italic">Double-click to edit…</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
