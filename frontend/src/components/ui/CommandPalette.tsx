import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { useCanvasStore } from '../../stores/canvasStore';

interface Command {
  id: string;
  icon: string;
  label: string;
  shortcut?: string;
  category: 'navigation' | 'canvas' | 'ai' | 'workspace';
  action: () => void;
}

export default function CommandPalette() {
  const navigate = useNavigate();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { addNode, toggleGrid, toggleWhatIfMode, undo, redo, fitView } = useCanvasStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [commandPaletteOpen]);

  const commands: Command[] = [
    { id: 'goto-workspace', icon: '🏠', label: 'Go to Workspace', category: 'navigation', action: () => navigate('/workspace') },
    { id: 'goto-library', icon: '📚', label: 'Go to Library', category: 'navigation', action: () => navigate('/library') },
    { id: 'goto-explore', icon: '🔭', label: 'Go to Explore', category: 'navigation', action: () => navigate('/explore') },
    { id: 'goto-profile', icon: '👤', label: 'Go to Profile', category: 'navigation', action: () => navigate('/profile') },
    { id: 'goto-admin', icon: '⚙', label: 'Admin Dashboard', category: 'navigation', action: () => navigate('/admin') },
    { id: 'add-text', icon: '📝', label: 'Add Text Node', shortcut: 'T', category: 'canvas', action: () => addNode({ id: `node-${Date.now()}`, type: 'text', position: { x: 300, y: 300 }, title: 'Text', content: '' }) },
    { id: 'toggle-grid', icon: '⊞', label: 'Toggle Grid', shortcut: '⌘G', category: 'canvas', action: toggleGrid },
    { id: 'what-if', icon: '⚠', label: 'Toggle What-If Mode', shortcut: '⌘W', category: 'canvas', action: toggleWhatIfMode },
    { id: 'undo', icon: '↩', label: 'Undo', shortcut: '⌘Z', category: 'canvas', action: undo },
    { id: 'redo', icon: '↪', label: 'Redo', shortcut: '⌘⇧Z', category: 'canvas', action: redo },
    { id: 'fit-view', icon: '⊡', label: 'Fit View', shortcut: '⌘F', category: 'canvas', action: fitView },
  ];

  const filtered = query.trim()
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const categories = [...new Set(filtered.map((c) => c.category))];

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    canvas: 'Canvas',
    ai: 'AI',
    workspace: 'Workspace',
  };

  const handleSelect = (command: Command) => {
    command.action();
    setCommandPaletteOpen(false);
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
            onClick={() => setCommandPaletteOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-[var(--bg-card)]/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
              {/* Search input */}
              <div className="flex items-center gap-4 px-6 py-5 border-b border-white/10 bg-white/5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--purple)] shrink-0">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent font-display text-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none selection:bg-[var(--purple)]/30"
                />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-medium text-[var(--text-muted)] bg-white/5 border border-white/10 px-2 py-1 rounded-md uppercase tracking-wider">
                    Esc
                  </span>
                </div>
              </div>

              {/* Command list */}
              <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
                {filtered.length === 0 ? (
                  <div className="px-6 py-12 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[var(--text-muted)] mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                      </svg>
                    </div>
                    <p className="font-display text-base text-[var(--text-primary)]">No results found</p>
                    <p className="font-body text-sm text-[var(--text-muted)]">Try searching for something else</p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category} className="mb-2">
                      <p className="px-6 pt-4 pb-2 font-display text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                        {categoryLabels[category] || category}
                      </p>
                      <div className="px-2">
                        {filtered
                          .filter((c) => c.category === category)
                          .map((command) => (
                            <button
                              key={command.id}
                              onClick={() => handleSelect(command)}
                              className="w-full px-4 py-3 flex items-center gap-4 rounded-xl hover:bg-white/5 transition-all group text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-base group-hover:scale-110 group-hover:bg-[var(--purple)]/10 group-hover:border-[var(--purple)]/30 transition-all shadow-sm">
                                {command.icon}
                              </div>
                              <span className="font-body text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors flex-1">
                                {command.label}
                              </span>
                              {command.shortcut && (
                                <span className="font-mono text-[10px] font-medium text-[var(--text-muted)] bg-white/5 border border-white/10 px-2 py-1 rounded-md group-hover:border-white/20 transition-colors">
                                  {command.shortcut}
                                </span>
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
