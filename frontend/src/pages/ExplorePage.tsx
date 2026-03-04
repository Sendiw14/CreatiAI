import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface ExplorePost {
  id: string
  userId: string
  userDisplayName: string
  userAvatar?: string
  title: string
  description: string
  thumbnail?: string
  tags: string[]
  likeCount: number
  forkCount: number
  liked: boolean
  featured: boolean
  createdAt: string
  type: 'canvas' | 'sketch' | 'concept'
}

type ExploreTab = 'trending' | 'newest' | 'featured' | 'following'
type FilterTag = string | null

// Mock data
const MOCK_POSTS: ExplorePost[] = Array.from({ length: 15 }, (_, i) => ({
  id: `post-${i}`,
  userId: `user-${i % 5}`,
  userDisplayName: ['Alex Kim', 'Sam Rivera', 'Jordan Lee', 'Casey Chen', 'Riley Park'][i % 5],
  title: [
    'Brand identity exploration',
    'Product design sprint concepts',
    'Abstract landscape study',
    'UI system foundations',
    'Narrative storyboard draft',
    'Spatial thinking map',
    'Color theory canvas',
    'Ideation session notes',
    'Visual metaphor library',
    'Concept cross-pollination',
  ][i % 10],
  description: 'A collaborative canvas exploring visual connections between disparate creative domains.',
  tags: [['branding', 'design', 'concept', 'ui', 'visual'][i % 5], ['creative', 'ai', 'sketch', 'exploration'][i % 4]],
  likeCount: Math.floor(Math.random() * 200) + 5,
  forkCount: Math.floor(Math.random() * 50),
  liked: i % 3 === 0,
  featured: i < 3,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  type: (['canvas', 'sketch', 'concept'] as const)[i % 3],
}))

const ALL_TAGS = Array.from(new Set(MOCK_POSTS.flatMap(p => p.tags)))

export default function ExplorePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ExploreTab>('trending')
  const [activeTag, setActiveTag] = useState<FilterTag>(null)
  const [search, setSearch] = useState('')
  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    new Set(MOCK_POSTS.filter(p => p.liked).map(p => p.id))
  )

  const { data: posts = MOCK_POSTS, isLoading } = useQuery({
    queryKey: ['explore', activeTab],
    queryFn: async () => {
      try {
        const res = await api.get(`/explore?tab=${activeTab}`)
        return res.data as ExplorePost[]
      } catch {
        return MOCK_POSTS
      }
    },
  })

  const filtered = posts
    .filter(p => !activeTag || p.tags.includes(activeTag))
    .filter(p =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.userDisplayName.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    )

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev)
      next.has(postId) ? next.delete(postId) : next.add(postId)
      return next
    })
  }

  const tabs: { id: ExploreTab; label: string }[] = [
    { id: 'trending', label: 'Trending' },
    { id: 'newest', label: 'Newest' },
    { id: 'featured', label: 'Featured' },
    { id: 'following', label: 'Following' },
  ]

  const featuredPosts = filtered.filter(p => p.featured).slice(0, 3)
  const regularPosts = filtered.filter(p => activeTab !== 'featured' || !p.featured)

  return (
    <div className="min-h-screen bg-[var(--bg-page)] font-body selection:bg-[var(--purple)]/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-[var(--bg-surface)]/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
          <button
            onClick={() => navigate('/workspace')}
            className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
              <path d="M7 14.5L2 9l5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 9h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--purple)]/20 to-[var(--cyan)]/20 flex items-center justify-center border border-[var(--purple)]/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <span className="text-sm text-[var(--purple)]">✦</span>
            </div>
            <h1 className="text-lg font-display font-bold text-[var(--text-primary)] tracking-wide">Explore</h1>
          </div>

          {/* Tabs */}
          <div className="hidden md:flex gap-2 ml-8 bg-white/5 p-1.5 rounded-2xl border border-white/5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-md border border-white/10 scale-[1.02]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="ml-auto relative w-64 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-500" />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--purple)] transition-colors" width="16" height="16" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search canvases..."
              className="relative w-full pl-10 pr-4 h-11 rounded-xl bg-[var(--bg-card)]/40 backdrop-blur-md border border-white/10 text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)]/50 focus:bg-white/10 transition-all duration-300 shadow-inner"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Tags filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-4 h-9 rounded-xl text-xs font-display font-bold tracking-wider uppercase transition-all duration-300 border ${
              !activeTag
                ? 'border-[var(--purple)]/50 bg-[var(--purple)]/10 text-[var(--purple)] shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                : 'border-white/10 text-[var(--text-muted)] hover:border-white/30 hover:bg-white/5 hover:text-[var(--text-secondary)]'
            }`}
          >
            All
          </button>
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-4 h-9 rounded-xl text-xs font-display font-bold tracking-wider uppercase transition-all duration-300 border ${
                activeTag === tag
                  ? 'border-[var(--cyan)]/50 bg-[var(--cyan)]/10 text-[var(--cyan)] shadow-[0_0_15px_rgba(8,145,178,0.15)]'
                  : 'border-white/10 text-[var(--text-muted)] hover:border-white/30 hover:bg-white/5 hover:text-[var(--text-secondary)]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Featured strip */}
        {activeTab === 'featured' && featuredPosts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[var(--gold)]/10 flex items-center justify-center border border-[var(--gold)]/30">
                <span className="text-[var(--gold)] text-sm">★</span>
              </div>
              <h2 className="text-sm font-display font-bold text-[var(--text-primary)] uppercase tracking-widest">
                Featured by CreatiAI
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.1 }}
                  className="group relative rounded-3xl border border-white/10 overflow-hidden bg-[var(--bg-card)]/40 backdrop-blur-xl cursor-pointer hover:border-[var(--gold)]/50 hover:shadow-[0_10px_40px_-10px_rgba(245,158,11,0.2)] transition-all duration-500"
                >
                  {/* Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-[var(--purple)]/20 via-[var(--bg-card)] to-[var(--cyan)]/10 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
                    <span className="text-5xl opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500 group-hover:text-[var(--gold)]">✦</span>
                  </div>
                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded-md text-[10px] font-display font-bold tracking-widest uppercase bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]">Featured</span>
                    </div>
                    <h3 className="font-display font-bold text-[var(--text-primary)] text-base mt-3 line-clamp-1 group-hover:text-[var(--gold)] transition-colors">{post.title}</h3>
                    <p className="text-sm font-body text-[var(--text-muted)] mt-1">{post.userDisplayName}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Main grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-3xl bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {regularPosts.map((post, i) => (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.05 }}
                  className="group bg-[var(--bg-card)]/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:border-[var(--purple)]/50 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.2)] transition-all duration-500 cursor-pointer flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="h-40 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, hsl(${(i * 47) % 360}, 40%, 15%) 0%, hsl(${(i * 47 + 120) % 360}, 30%, 10%) 100%)`
                    }}
                  >
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30 mix-blend-overlay" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl opacity-20 group-hover:scale-125 group-hover:opacity-40 transition-all duration-700 group-hover:rotate-12">
                        {post.type === 'canvas' ? '⬡' : post.type === 'sketch' ? '✏' : '◎'}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-display font-bold tracking-widest uppercase border backdrop-blur-md shadow-lg ${
                        post.type === 'canvas' ? 'bg-[var(--purple)]/20 text-[var(--purple)] border-[var(--purple)]/30'
                        : post.type === 'sketch' ? 'bg-[var(--gold)]/20 text-[var(--gold)] border-[var(--gold)]/30'
                        : 'bg-[var(--cyan)]/20 text-[var(--cyan)] border-[var(--cyan)]/30'
                      }`}>
                        {post.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    {/* User */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-display font-bold text-white shadow-inner border border-white/20"
                        style={{ background: `hsl(${post.userId.charCodeAt(5) * 47 % 360}, 70%, 50%)` }}
                      >
                        {post.userDisplayName[0]}
                      </div>
                      <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{post.userDisplayName}</span>
                    </div>

                    <h3 className="text-base font-display font-bold text-[var(--text-primary)] line-clamp-2 leading-snug mb-3 group-hover:text-[var(--purple)] transition-colors">
                      {post.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                      {post.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-md text-[10px] font-mono font-medium bg-white/5 border border-white/10 text-[var(--text-muted)] group-hover:border-white/20 transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                      <button
                        onClick={e => { e.stopPropagation(); toggleLike(post.id) }}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-300 ${
                          likedPosts.has(post.id) ? 'text-[var(--error)] scale-110' : 'text-[var(--text-muted)] hover:text-[var(--error)] hover:scale-110'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 12 12" fill={likedPosts.has(post.id) ? 'currentColor' : 'none'}>
                          <path d="M6 10.5C6 10.5 1 7.5 1 4.5C1 3 2 2 3.5 2C4.5 2 5.5 2.5 6 3.5C6.5 2.5 7.5 2 8.5 2C10 2 11 3 11 4.5C11 7.5 6 10.5 6 10.5Z" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        {post.likeCount + (likedPosts.has(post.id) && !post.liked ? 1 : !likedPosts.has(post.id) && post.liked ? -1 : 0)}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors">
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                          <path d="M3 9V3l9 3-9 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                        {post.forkCount}
                      </button>
                      <button
                        onClick={() => navigate(`/workspace/${post.id}`)}
                        className="ml-auto text-xs font-display font-bold tracking-widest uppercase text-[var(--purple)] hover:text-[var(--cyan)] transition-colors flex items-center gap-1"
                      >
                        Open
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
