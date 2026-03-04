import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import api from '../lib/api'

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'image' | 'text' | 'sketch' | 'mixed'
type SortField = 'updatedAt' | 'createdAt' | 'name'

interface LibraryItem {
  id: string
  projectId: string
  projectName: string
  type: 'image' | 'text' | 'sketch' | 'ai_generated'
  content: string
  thumbnail?: string
  tags: string[]
  createdAt: string
}

// Mock data — will be replaced by real API
const MOCK_ITEMS: LibraryItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `item-${i}`,
  projectId: `proj-${i % 4}`,
  projectName: ['Untitled Canvas', 'Brand Refresh', 'Product Strategy', 'Design System'][i % 4],
  type: (['image', 'text', 'ai_generated', 'sketch'] as const)[i % 4],
  content: `Asset ${i + 1}`,
  tags: [['branding', 'visual', 'concept', 'draft'][i % 4], 'library'],
  createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
}))

export default function LibraryPage() {
  const navigate = useNavigate()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortField>('createdAt')
  const [search, setSearch] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const { data: items = MOCK_ITEMS, isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      try {
        const res = await api.get('/library')
        return res.data as LibraryItem[]
      } catch {
        return MOCK_ITEMS
      }
    },
  })

  const filtered = items
    .filter(item => filter === 'all' || item.type === filter)
    .filter(item => !activeTag || item.tags.includes(activeTag))
    .filter(item =>
      !search ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.projectName.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === 'name') return a.content.localeCompare(b.content)
      return 0
    })

  const allTags = Array.from(new Set(items.flatMap(i => i.tags)))

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const typeIcon = (type: LibraryItem['type']) => {
    const icons = {
      image: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
          <circle cx="5.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M1 11l4-4 3 3 2-2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ),
      text: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 4h10M3 7h10M3 10h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
      sketch: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 13l3-1 7-7-2-2-7 7-1 3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      ),
      ai_generated: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M6 8h4M8 6v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    }
    return icons[type]
  }

  const typeColor = (type: LibraryItem['type']) => ({
    image: 'text-[var(--cyan)]',
    text: 'text-[var(--text-muted)]',
    sketch: 'text-[var(--gold)]',
    ai_generated: 'text-[var(--purple)]',
  }[type])

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col font-body selection:bg-[var(--purple)]/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-[var(--bg-surface)]/60 backdrop-blur-xl shrink-0 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/workspace')}
            className="group flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            Workspace
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--purple)] animate-pulse" />
            <span className="text-[var(--text-primary)] text-sm font-display font-medium tracking-wide">Library</span>
          </div>

          {selectedItems.size > 0 && (
            <div className="ml-auto flex items-center gap-3 bg-[var(--bg-card)]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
              <span className="text-sm font-medium text-[var(--text-primary)]"><span className="text-[var(--purple)]">{selectedItems.size}</span> selected</span>
              <div className="w-px h-4 bg-white/10" />
              <button className="px-3 py-1.5 rounded-lg text-xs font-display font-bold tracking-wider uppercase border border-[var(--error)]/30 text-[var(--error)] hover:bg-[var(--error)]/10 hover:border-[var(--error)]/50 transition-all">
                Delete
              </button>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-3 py-1.5 rounded-lg text-xs font-display font-bold tracking-wider uppercase border border-white/10 text-[var(--text-muted)] hover:border-white/30 hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
              >
                Deselect
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-500" />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--purple)] transition-colors" width="16" height="16" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search library..."
              className="relative w-full pl-10 pr-4 h-11 rounded-xl bg-[var(--bg-card)]/40 backdrop-blur-md border border-white/10 text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)]/50 focus:bg-white/10 transition-all duration-300 shadow-inner"
            />
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
            {(['all', 'image', 'text', 'sketch', 'ai_generated'] as (FilterType | 'ai_generated')[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f === 'ai_generated' ? 'all' : f as FilterType)}
                className={`px-4 h-9 rounded-xl text-xs font-display font-bold tracking-wider uppercase transition-all duration-300 ${
                  filter === f
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-md border border-white/10 scale-[1.02]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5 border border-transparent'
                }`}
              >
                {f === 'ai_generated' ? 'AI' : f}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative group">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortField)}
              className="appearance-none h-11 pl-4 pr-10 rounded-xl bg-[var(--bg-card)]/40 backdrop-blur-md border border-white/10 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--purple)]/50 focus:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              <option value="createdAt" className="bg-[var(--bg-card)]">Newest first</option>
              <option value="updatedAt" className="bg-[var(--bg-card)]">Recently updated</option>
              <option value="name" className="bg-[var(--bg-card)]">Name A–Z</option>
            </select>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {/* View mode */}
          <div className="flex gap-1 bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            {(['grid', 'list'] as ViewMode[]).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  viewMode === m 
                    ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                    : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                {m === 'grid' ? (
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="8" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="1" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="8" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                    <path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  activeTag === tag
                    ? 'bg-[var(--cyan)]/20 text-[var(--cyan)] border border-[var(--cyan)]/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-white/5 border border-white/10 text-[var(--text-muted)] hover:text-white hover:border-white/20 hover:bg-white/10'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Grid / List */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="var(--text-muted)" strokeWidth="1.5"/>
                <path d="M7 10h10M7 13h6" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[var(--text-primary)] text-lg font-medium mb-2">No items found</p>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">
              {search ? 'Try adjusting your search or filters to find what you are looking for.' : 'Items you save from your creative sessions will appear here.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.05 }}
                  onClick={() => toggleSelect(item.id)}
                  className={`group relative aspect-square rounded-2xl bg-white/5 backdrop-blur-xl border cursor-pointer overflow-hidden transition-all duration-500 ${
                    selectedItems.has(item.id)
                      ? 'border-[var(--purple)] shadow-[0_0_30px_rgba(157,78,221,0.3)]'
                      : 'border-white/10 hover:border-white/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-1'
                  }`}
                >
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.content} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-inner ${typeColor(item.type)}`}>
                        {typeIcon(item.type)}
                      </div>
                      <p className="text-sm text-[var(--text-muted)] text-center line-clamp-3 group-hover:text-white transition-colors duration-300">{item.content}</p>
                    </div>
                  )}

                  {/* Glassmorphic Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5 z-20">
                    <p className="text-sm font-medium text-white truncate mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.content}</p>
                    <p className="text-xs text-[var(--cyan)] translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{item.projectName}</p>
                  </div>

                  {/* Selected check */}
                  {selectedItems.has(item.id) && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--purple)] flex items-center justify-center shadow-[0_0_15px_rgba(157,78,221,0.5)] z-30"
                    >
                      <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.05 }}
                onClick={() => toggleSelect(item.id)}
                className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-xl ${
                  selectedItems.has(item.id)
                    ? 'border-[var(--purple)] bg-[var(--purple)]/10 shadow-[0_0_20px_rgba(157,78,221,0.15)]'
                    : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:-translate-y-0.5'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner transition-transform duration-300 group-hover:scale-110 ${typeColor(item.type)}`}>
                  {typeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-white transition-colors">{item.content}</p>
                  <p className="text-xs text-[var(--cyan)] mt-1">{item.projectName}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-[var(--text-muted)] group-hover:border-white/20 group-hover:text-white/80 transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-medium text-[var(--text-muted)] shrink-0 w-16 text-right group-hover:text-white/60 transition-colors">{format(new Date(item.createdAt), 'MMM d')}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
