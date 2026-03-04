import { useRef, useEffect, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';

interface SketchData {
  type: string;
  content: string;
  label?: string;
  createdBy?: string;
  createdAt?: string;
}

export default function SketchNode({ data, selected }: NodeProps<SketchData>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#7b61ff');
  const [size] = useState(3);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'transparent';
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [color, size]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative rounded-2xl border backdrop-blur-xl transition-all duration-300 overflow-hidden ${
        selected
          ? 'border-[var(--cyan)] shadow-[0_0_30px_rgba(0,212,255,0.2)] bg-[var(--bg-card)]/90'
          : 'border-[var(--border)] bg-[var(--bg-card)]/60 hover:border-[var(--cyan)]/50 hover:bg-[var(--bg-card)]/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
      }`}
      style={{ width: 320 }}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--cyan)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[var(--cyan)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="target" position={Position.Left} id="left" className="!w-3 !h-3 !bg-[var(--cyan)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-[var(--cyan)] !border-2 !border-[var(--bg-card)] transition-transform hover:scale-150" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]/50 bg-gradient-to-r from-[var(--bg-card)] to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-[var(--cyan)]/10 flex items-center justify-center border border-[var(--cyan)]/20">
            <span className="text-xs text-[var(--cyan)]">✏️</span>
          </div>
          <span className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-secondary)]">{data.label || 'Sketch'}</span>
        </div>
        <div className="flex items-center gap-3 nodrag">
          <div className="flex gap-1.5 bg-[var(--bg-input)] p-1.5 rounded-xl border border-[var(--border)]/50">
            {['#7b61ff', '#00d4ff', '#ffd700', '#ff6b6b', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${color === c ? 'border-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-transparent hover:scale-110'}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <button
            onClick={clearCanvas}
            className="font-display font-bold tracking-widest uppercase text-[10px] text-[var(--text-muted)] hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
          >
            clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="nodrag cursor-crosshair relative" style={{ height: 240, background: 'var(--bg-input)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-muted) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          style={{ display: 'block' }}
        />
      </div>
    </motion.div>
  );
}
