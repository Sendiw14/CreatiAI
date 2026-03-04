import { useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';

interface ImageNodeData {
  imageUrl?: string;
  caption?: string;
  title?: string;
  content?: string;
  label?: string;
  [key: string]: unknown;
}

export default function ImageNode({ data, selected }: NodeProps<ImageNodeData>) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative min-w-[240px] max-w-[400px] rounded-2xl border backdrop-blur-xl transition-all duration-300 overflow-hidden ${
        selected
          ? 'border-[var(--cyan)] shadow-[0_0_30px_rgba(0,212,255,0.2)] bg-[var(--bg-card)]/90'
          : 'border-[var(--border)] bg-[var(--bg-card)]/60 hover:border-[var(--cyan)]/50 hover:bg-[var(--bg-card)]/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--cyan)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[var(--cyan)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="target" position={Position.Left} id="left" className="!w-3 !h-3 !bg-[var(--cyan)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-[var(--cyan)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]/50 bg-gradient-to-r from-[var(--bg-card)] to-transparent">
        <div className="w-6 h-6 rounded-lg bg-[var(--cyan)]/10 flex items-center justify-center border border-[var(--cyan)]/20">
          <span className="text-xs text-[var(--cyan)]">🖼</span>
        </div>
        <span className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-secondary)]">{data.label || 'Image'}</span>
      </div>

      {/* Image content */}
      <div className="nodrag relative group">
        {data.content ? (
          <div className="relative">
            <img
              src={data.content as string}
              alt={data.label || ''}
              className="w-full h-auto object-cover max-h-[300px] transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-40 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border)]/50"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--bg-input)] flex items-center justify-center border border-[var(--border)] shadow-sm group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl text-[var(--cyan)]">+</span>
            </div>
            <span className="font-display font-bold tracking-widest uppercase text-[10px]">Click to add image</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              data.content = url;
            }
          }}
        />
      </div>

      {/* Caption */}
      {data.content && (
        <div className="p-3 px-4 bg-[var(--bg-card)]/80 backdrop-blur-md border-t border-[var(--border)]/50">
          <input
            className="w-full bg-transparent font-body text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            placeholder="Add caption…"
          />
        </div>
      )}
    </motion.div>
  );
}
