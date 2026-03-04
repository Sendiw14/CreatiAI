import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCanvasStore } from '../../stores/canvasStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'

type ExportFormat = 'png' | 'svg' | 'pdf' | 'json' | 'markdown'

interface ExportOption {
  format: ExportFormat
  label: string
  description: string
  icon: string
  supportsWhiteBg: boolean
}

const EXPORT_OPTIONS: ExportOption[] = [
  { format: 'png', label: 'PNG Image', description: 'High-resolution raster image, great for sharing', icon: '🖼', supportsWhiteBg: true },
  { format: 'svg', label: 'SVG Vector', description: 'Scalable vector graphic, perfect for design tools', icon: '✦', supportsWhiteBg: true },
  { format: 'pdf', label: 'PDF Document', description: 'Print-ready PDF with all canvas content', icon: '📄', supportsWhiteBg: true },
  { format: 'json', label: 'Canvas JSON', description: 'Raw canvas data — import back into CreatiAI', icon: '{ }', supportsWhiteBg: false },
  { format: 'markdown', label: 'Markdown', description: 'Text content as structured Markdown document', icon: 'Md', supportsWhiteBg: false },
]

export default function ExportPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { nodes, edges } = useCanvasStore()

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png')
  const [whiteBg, setWhiteBg] = useState(false)
  const [includeComments, setIncludeComments] = useState(false)
  const [includeAIResponses, setIncludeAIResponses] = useState(true)
  const [scale, setScale] = useState(2)
  const [exporting, setExporting] = useState(false)

  const selected = EXPORT_OPTIONS.find(o => o.format === selectedFormat)!

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.post(`/projects/${projectId}/export`, {
        format: selectedFormat,
        options: { whiteBg, includeComments, includeAIResponses, scale },
      }, { responseType: 'blob' })

      // Trigger download
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `canvas-export.${selectedFormat}`
      a.click()
      URL.revokeObjectURL(url)

      toast.success(`Exported as ${selectedFormat.toUpperCase()}`)
    } catch {
      // Fallback: export canvas JSON locally
      if (selectedFormat === 'json') {
        const data = JSON.stringify({ nodes, edges }, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'canvas.json'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Exported canvas JSON')
      } else if (selectedFormat === 'markdown') {
        const md = nodes
          .filter(n => n.type === 'text' || n.type === 'ai_generated')
          .map(n => `## Node: ${n.id}\n\n${((n as unknown as { data: Record<string, string> }).data)?.text ?? ''}\n`)
          .join('\n---\n\n')
        const blob = new Blob([md], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'canvas.md'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Exported as Markdown')
      } else {
        toast.error('Export requires backend connection')
      }
    } finally {
      setExporting(false)
    }
  }

  const Toggle = ({ value, onChange, label, description }: { value: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-[var(--text-primary)]">{label}</p>
        {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${value ? 'bg-[var(--purple)]' : 'bg-[var(--border)]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border)]/50 bg-[var(--bg-card)]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/workspace/${projectId}`)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight">Export Canvas</h1>
            <p className="font-body text-xs text-[var(--text-muted)]">Save your work in various formats</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Formats */}
        <div className="space-y-6">
          <div>
            <h2 className="font-display font-bold text-lg mb-2">Select Format</h2>
            <p className="font-body text-sm text-[var(--text-muted)]">Choose how you want to export your canvas.</p>
          </div>

          <div className="space-y-3">
            {EXPORT_OPTIONS.map((opt) => (
              <button
                key={opt.format}
                onClick={() => setSelectedFormat(opt.format)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                  selectedFormat === opt.format
                    ? 'border-[var(--purple)] bg-[var(--purple)]/10 shadow-[0_0_20px_rgba(123,97,255,0.1)]'
                    : 'border-[var(--border)]/50 bg-[var(--bg-card)] hover:border-[var(--purple)]/30 hover:bg-[var(--bg-hover)]'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${
                  selectedFormat === opt.format ? 'bg-[var(--purple)]/20 text-[var(--purple)]' : 'bg-[var(--bg-input)] text-[var(--text-muted)] group-hover:text-[var(--purple)]'
                }`}>
                  {opt.icon}
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">{opt.label}</h3>
                  <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">{opt.description}</p>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedFormat === opt.format ? 'border-[var(--purple)]' : 'border-[var(--border)]'
                }`}>
                  {selectedFormat === opt.format && <div className="w-2.5 h-2.5 rounded-full bg-[var(--purple)]" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Options & Preview */}
        <div className="space-y-8">
          <div className="bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border)]/50 rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <h2 className="font-display font-bold text-lg mb-6">Export Options</h2>
            
            <div className="space-y-6">
              {selected.supportsWhiteBg && (
                <Toggle
                  label="White Background"
                  description="Use a solid white background instead of transparent/dark"
                  value={whiteBg}
                  onChange={setWhiteBg}
                />
              )}
              
              <Toggle
                label="Include Comments"
                description="Show user comments and annotations in the export"
                value={includeComments}
                onChange={setIncludeComments}
              />
              
              <Toggle
                label="Include AI Responses"
                description="Keep AI generated content and suggestions"
                value={includeAIResponses}
                onChange={setIncludeAIResponses}
              />

              {['png', 'pdf'].includes(selectedFormat) && (
                <div className="pt-4 border-t border-[var(--border)]/50">
                  <div className="flex items-center justify-between mb-4">
                    <label className="font-body text-sm text-[var(--text-primary)]">Export Scale</label>
                    <span className="font-mono text-xs text-[var(--purple)] bg-[var(--purple)]/10 px-2 py-1 rounded-md border border-[var(--purple)]/20">{scale}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.5"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-[var(--purple)]"
                  />
                  <div className="flex justify-between mt-2 font-mono text-[10px] text-[var(--text-muted)]">
                    <span>1x (Standard)</span>
                    <span>4x (Print Quality)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] text-white font-display font-bold text-sm shadow-[0_0_20px_rgba(123,97,255,0.3)] hover:shadow-[0_0_30px_rgba(123,97,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <span>⬇</span> Export {selected.label}
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
