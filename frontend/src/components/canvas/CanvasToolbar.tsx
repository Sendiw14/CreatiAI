import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '../../stores/canvasStore';
import { useUserStore } from '../../stores/userStore';

type Tool = 'select' | 'text' | 'image' | 'sketch' | 'group' | 'pan' | 'connect';

const tools: { id: Tool; icon: string; label: string; shortcut: string }[] = [
  { id: 'select', icon: '↖', label: 'Select', shortcut: 'V' },
  { id: 'text', icon: '📝', label: 'Text node', shortcut: 'T' },
  { id: 'image', icon: '🖼', label: 'Image node', shortcut: 'I' },
  { id: 'sketch', icon: '✏️', label: 'Sketch node', shortcut: 'S' },
  { id: 'group', icon: '⬛', label: 'Group', shortcut: 'G' },
  { id: 'connect', icon: '→', label: 'Connect', shortcut: 'C' },
  { id: 'pan', icon: '✋', label: 'Pan', shortcut: 'H' },
];

export default function CanvasToolbar() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [showTooltip, setShowTooltip] = useState<Tool | null>(null);
  const { addNode, toggleGrid, gridVisible, undo, redo, undoStack, redoStack } = useCanvasStore();
  const { user } = useUserStore();

  const handleToolSelect = (tool: Tool) => {
    setActiveTool(tool);
  };

  const handleAddNode = (type: 'text' | 'image' | 'sketch' | 'group') => {
    addNode({
      id: `node-${Date.now()}`,
      type,
      position: { x: 400 + Math.random() * 200, y: 300 + Math.random() * 200 },
      title: type.charAt(0).toUpperCase() + type.slice(1),
      content: '',
      createdBy: user?.id || 'local',
    });
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex items-center gap-1.5 px-3 py-2.5 glass rounded-full border border-[var(--border)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),0_0_20px_rgba(147,51,234,0.1)]"
      >
        {/* Tool buttons */}
        {tools.map((tool) => (
          <div key={tool.id} className="relative">
            <button
              onClick={() => {
                handleToolSelect(tool.id);
                if (tool.id === 'text') handleAddNode('text');
                if (tool.id === 'image') handleAddNode('image');
                if (tool.id === 'sketch') handleAddNode('sketch');
                if (tool.id === 'group') handleAddNode('group');
              }}
              onMouseEnter={() => setShowTooltip(tool.id)}
              onMouseLeave={() => setShowTooltip(null)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition-all duration-200 ${
                activeTool === tool.id
                  ? 'bg-gradient-to-br from-[var(--purple)] to-[var(--cyan)] text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] scale-110'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:scale-105'
              }`}
              aria-label={tool.label}
            >
              {tool.icon}
            </button>

            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip === tool.id && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl z-50 flex flex-col items-center gap-0.5"
                >
                  <p className="font-display font-semibold text-xs text-[var(--text-primary)]">{tool.label}</p>
                  <p className="font-mono text-[10px] text-[var(--text-muted)]">{tool.shortcut}</p>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--bg-elevated)] border-b border-r border-[var(--border)] rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="w-px h-8 bg-[var(--border)] mx-2 opacity-50" />

        {/* Grid toggle */}
        <button
          onClick={toggleGrid}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition-all duration-200 ${
            gridVisible
              ? 'bg-[var(--cyan)]/20 text-[var(--cyan)] shadow-[inset_0_0_0_1px_rgba(8,145,178,0.3)]'
              : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
          }`}
          aria-label="Toggle grid"
          title="Toggle grid (⌘G)"
        >
          ⊞
        </button>

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center text-base text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--text-muted)] transition-all duration-200"
          aria-label="Undo"
          title="Undo (⌘Z)"
        >
          ↩
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center text-base text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--text-muted)] transition-all duration-200"
          aria-label="Redo"
          title="Redo (⌘⇧Z)"
        >
          ↪
        </button>
      </motion.div>
    </div>
  );
}
