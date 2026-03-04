import { useEffect } from 'react';

type ShortcutMap = Record<string, () => void>;

function getKey(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.metaKey || e.ctrlKey) parts.push('mod');
  if (e.shiftKey) parts.push('shift');
  if (e.altKey) parts.push('alt');
  if (e.key && e.key !== 'Control' && e.key !== 'Meta' && e.key !== 'Shift' && e.key !== 'Alt') {
    parts.push(e.key);
  }
  return parts.join('+');
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = getKey(e);
      const action = shortcuts[key];
      if (action) {
        e.preventDefault();
        action();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
