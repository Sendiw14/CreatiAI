import { Handle, Position, NodeProps } from 'reactflow';

interface GroupData {
  type: string;
  content?: string;
  label?: string;
  width?: number;
  height?: number;
  createdBy?: string;
  createdAt?: string;
}

export default function GroupNode({ data, selected }: NodeProps<GroupData>) {
  return (
    <div
      className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 backdrop-blur-sm ${
        selected ? 'border-[var(--purple)] bg-[var(--purple)]/5 shadow-[0_0_40px_rgba(123,97,255,0.1)]' : 'border-[var(--border-active)] bg-[var(--bg-hover)]/20 hover:border-[var(--purple)]/40 hover:bg-[var(--purple)]/5'
      }`}
      style={{ width: data.width || 400, height: data.height || 300 }}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--purple)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[var(--purple)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />

      {/* Label */}
      <div className="absolute -top-3 left-4 flex items-center gap-2">
        <span className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2">
          <span className="text-[var(--purple)]">⬚</span> {data.label || 'Group'}
        </span>
      </div>
    </div>
  );
}
