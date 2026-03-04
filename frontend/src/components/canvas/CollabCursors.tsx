import { useCollabStore } from '../../stores/collabStore';
import type { CursorPosition } from '../../types';

interface Props {
  canvasRef?: React.RefObject<HTMLDivElement>;
}

const CURSOR_COLORS = [
  '#7b61ff', '#00d4ff', '#ffd700', '#ff6b6b', '#a8e6a3',
  '#ff9a3c', '#c084fc', '#34d399',
];

export default function CollabCursors(_props: Props) {
  const { cursors, collaborators } = useCollabStore();

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {Object.entries(cursors).map(([userId, cursor]: [string, CursorPosition]) => {
        const collab = collaborators.find((c: { userId: string }) => c.userId === userId);
        const color = collab?.cursorColor || CURSOR_COLORS[0];
        const name = collab?.user?.name || cursor.name || 'User';

        return (
          <div
            key={userId}
            className="absolute transition-transform duration-75"
            style={{ left: cursor.x, top: cursor.y, transform: 'translate(-2px, -2px)' }}
          >
            {/* Cursor SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ filter: `drop-shadow(0 1px 3px ${color}60)` }}>
              <path d="M3 2L17 10L10 11L7 18L3 2Z" fill={color} stroke="white" strokeWidth="1"/>
            </svg>
            {/* Name tag */}
            <div
              className="absolute left-4 top-0 px-1.5 py-0.5 rounded-md text-xs font-body font-medium whitespace-nowrap"
              style={{ background: color, color: '#080910' }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
