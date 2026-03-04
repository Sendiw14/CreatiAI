import { useState, useRef, useEffect } from 'react';
import { useAIStore } from '../../stores/aiStore';
import { useUserStore } from '../../stores/userStore';
import { useCanvasStore } from '../../stores/canvasStore';
import AIResponseCard from './AIResponseCard';

type InputMode = 'text' | 'voice' | 'image' | 'sketch';

interface Props {
  projectId: string;
}

export default function AICoCreatorPanel({ projectId }: Props) {
  const { responses, isStreaming, sendPrompt, cancelStream } = useAIStore();
  const { user } = useUserStore();
  const { nodes } = useCanvasStore();

  const [mode, setMode] = useState<InputMode>('text');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [recording, setRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new response comes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses.length]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleSend = async () => {
    if (!prompt.trim() && mode === 'text') return;
    const text = mode === 'text' ? prompt : imageUrl || prompt;
    if (!text.trim()) return;
    setPrompt('');
    setImageUrl('');
    await sendPrompt({
      projectId,
      prompt: text,
      inputType: mode,
      assertiveness: 3,
      randomnessMode: 'balanced',
      whatIfMode: false,
      canvasContext: {
        nodeCount: nodes.length,
        selectedNodeIds: [],
        recentNodeTitles: nodes.slice(-3).map(n => n.title),
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  };

  const tabs: { id: InputMode; icon: string; label: string }[] = [
    { id: 'text', icon: '📝', label: 'Text' },
    { id: 'voice', icon: '🎙', label: 'Voice' },
    { id: 'image', icon: '🖼', label: 'Image' },
    { id: 'sketch', icon: '✏️', label: 'Sketch' },
  ];

  const contextSummary = nodes.length > 0
    ? `${nodes.length} node${nodes.length !== 1 ? 's' : ''} on canvas`
    : 'Empty canvas';

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-card)]/60 backdrop-blur-2xl border-r border-white/10 shadow-[10px_0_30px_-10px_rgba(0,0,0,0.5)] relative z-20">
      {/* Panel header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/10 shrink-0 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--purple)]/20 to-[var(--cyan)]/20 flex items-center justify-center border border-[var(--purple)]/30 shadow-[0_0_20px_rgba(139,92,246,0.2)] relative group">
            <div className="absolute inset-0 bg-[var(--purple)]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="text-base text-[var(--purple)] relative z-10">✦</span>
          </div>
          <span className="font-display font-bold text-lg text-[var(--text-primary)] tracking-wide">AI Co-Creator</span>
          {user?.mode === 'expert' && (
            <span className="ml-auto font-mono font-bold tracking-widest uppercase text-[10px] text-[var(--gold)] bg-[var(--gold)]/10 border border-[var(--gold)]/30 px-2.5 py-1 rounded-md shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              expert
            </span>
          )}
        </div>
        {/* Context badge */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md">
          <span className="text-sm text-[var(--cyan)] animate-pulse">⬡</span>
          <span className="font-mono text-xs font-medium text-[var(--text-secondary)] tracking-wide">Context: {contextSummary}</span>
        </div>
      </div>

      {/* Response history */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
        {responses.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-64 gap-6 text-center opacity-60 hover:opacity-100 transition-opacity duration-500">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--purple)]/10 to-[var(--cyan)]/10 flex items-center justify-center border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.15)] relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple)]/20 to-[var(--cyan)]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <span className="text-4xl text-[var(--text-muted)] relative z-10 group-hover:text-[var(--purple)] transition-colors duration-500">✦</span>
            </div>
            <p className="font-display text-base text-[var(--text-secondary)] leading-relaxed max-w-[240px]">
              Start with a thought. Any thought. What do you want to create?
            </p>
          </div>
        )}

        {responses.map((response) => (
          <AIResponseCard key={response.id} response={response} />
        ))}

        {isStreaming && (
          <div className="rounded-2xl border border-[var(--cyan)]/30 bg-[var(--bg-card)]/80 backdrop-blur-xl p-5 shadow-[0_10px_40px_-10px_rgba(8,145,178,0.2)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--purple)] via-[var(--cyan)] to-[var(--gold)] animate-[shimmer_2s_linear_infinite]" style={{ backgroundSize: '200% 100%' }} />
            <div className="flex items-center gap-4 mb-4">
              <span className="text-base text-[var(--cyan)] animate-pulse">✦</span>
              <span className="font-display font-bold tracking-widest uppercase text-xs text-[var(--cyan)]">Thinking…</span>
              <button
                onClick={cancelStream}
                className="ml-auto font-mono font-bold tracking-widest uppercase text-[10px] text-[var(--error)] hover:text-white hover:bg-[var(--error)]/80 px-3 py-1.5 rounded-lg transition-all border border-[var(--error)]/30 hover:border-[var(--error)]"
              >
                Cancel
              </button>
            </div>
            <div className="flex gap-2 ml-1">
              <span className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-bounce" style={{ animationDelay: '0ms' }}/>
              <span className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-bounce" style={{ animationDelay: '150ms' }}/>
              <span className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-bounce" style={{ animationDelay: '300ms' }}/>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-6 pb-6 pt-5 border-t border-white/10 shrink-0 space-y-4 bg-[var(--bg-card)]/80 backdrop-blur-2xl relative z-10 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.5)]">
        {/* Mode tabs */}
        <div className="flex gap-1.5 p-1.5 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-display font-semibold transition-all duration-300 ${
                mode === tab.id
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[0_5px_15px_-5px_rgba(0,0,0,0.5)] border border-white/10 scale-[1.02]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:inline tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Text input */}
        {mode === 'text' && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] rounded-2xl opacity-0 group-focus-within:opacity-20 blur-md transition-opacity duration-500" />
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind? ⌘↵ to send…"
              rows={2}
              disabled={isStreaming}
              className="relative w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--purple)]/50 focus:bg-white/10 transition-all duration-300 disabled:opacity-50 shadow-inner custom-scrollbar"
            />
          </div>
        )}

        {/* Voice input */}
        {mode === 'voice' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <button
              onClick={() => setRecording(!recording)}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                recording
                  ? 'bg-[var(--error)] shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse scale-110'
                  : 'bg-gradient-to-br from-[var(--purple)] to-[var(--cyan)] shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105'
              }`}
            >
              <span className="text-2xl">{recording ? '⏹' : '🎙'}</span>
            </button>
            <span className="font-display text-sm font-medium text-[var(--text-muted)] tracking-wide">
              {recording ? 'Listening… Click to stop' : 'Click to start voice input'}
            </span>
          </div>
        )}

        {/* Image input */}
        {mode === 'image' && (
          <div className="space-y-3">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL or describe what you see…"
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--cyan)]/50 focus:bg-white/10 transition-all duration-300 shadow-inner"
            />
            <p className="font-display text-xs font-medium text-[var(--text-muted)] text-center tracking-wide">or drop image onto canvas</p>
          </div>
        )}

        {/* Sketch input */}
        {mode === 'sketch' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="font-display text-sm font-medium text-[var(--text-muted)] text-center tracking-wide">
              Drag a Sketch node onto the canvas to begin drawing
            </p>
            <div
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/creati-node', 'sketch')}
              className="px-6 py-3 rounded-xl border-2 border-dashed border-white/20 text-sm font-display font-semibold text-[var(--text-muted)] cursor-grab hover:border-[var(--cyan)]/50 hover:text-[var(--cyan)] hover:bg-[var(--cyan)]/5 transition-all duration-300"
            >
              ✏️ Drag sketch node
            </div>
          </div>
        )}

        {/* Send button */}
        {(mode === 'text' || mode === 'image') && (
          <button
            onClick={isStreaming ? cancelStream : handleSend}
            disabled={!isStreaming && (mode === 'text' ? !prompt.trim() : !imageUrl.trim())}
            className={`w-full py-3.5 rounded-xl text-sm font-display font-bold tracking-wide transition-all duration-300 relative overflow-hidden group ${
              isStreaming
                ? 'bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] hover:bg-[var(--error)]/20 hover:border-[var(--error)]/50'
                : 'bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none border border-white/10'
            }`}
          >
            {!isStreaming && (
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isStreaming ? '✕ Cancel' : '✦ Think with me'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
