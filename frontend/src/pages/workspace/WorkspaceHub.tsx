import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../stores/userStore';
import api from '../../lib/api';
import type { Project } from '../../types';
import toast from 'react-hot-toast';

type SortKey = 'updatedAt' | 'createdAt' | 'name';
type View = 'grid' | 'list';

const emptyIllustration = (
  <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
    <rect x="20" y="30" width="60" height="60" rx="12" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5"/>
    <rect x="100" y="45" width="60" height="45" rx="12" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5"/>
    <circle cx="50" cy="58" r="8" fill="var(--purple)" opacity="0.3"/>
    <rect x="33" y="72" width="35" height="4" rx="2" fill="var(--border)"/>
    <rect x="33" y="80" width="22" height="3" rx="2" fill="var(--border)" opacity="0.5"/>
    <circle cx="130" cy="68" r="6" fill="var(--cyan)" opacity="0.3"/>
    <rect x="113" y="79" width="35" height="3" rx="2" fill="var(--border)"/>
    <path d="M80 60 L100 68" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 3"/>
  </svg>
);

export default function WorkspaceHub() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('grid');
  const [sort, setSort] = useState<SortKey>('updatedAt');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const newInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (showNew) {
      setTimeout(() => newInputRef.current?.focus(), 100);
    }
  }, [showNew]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const pjRes = await api.get('/projects');
      setProjects(pjRes.data.data || []);
    } catch {
      // Offline / unauthenticated — show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      setCreating(true);
      const res = await api.post('/projects', { title: newTitle.trim() });
      const project = res.data.data as Project;
      toast.success('Project created!');
      navigate(`/workspace/${project.id}`);
    } catch {
      toast.error('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const filteredProjects = projects
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'createdAt')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      {/* Top Nav */}
      <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 sticky top-0 z-40 bg-[var(--bg-page)]/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 select-none group">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9333EA" />
                  <stop offset="55%" stopColor="#0891B2" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
              <circle cx="7" cy="21" r="3.5" fill="url(#logoGrad)" />
              <circle cx="14" cy="7" r="3.5" fill="url(#logoGrad)" />
              <circle cx="21" cy="21" r="3.5" fill="url(#logoGrad)" />
              <line x1="7" y1="21" x2="14" y2="7" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.7" />
              <line x1="14" y1="7" x2="21" y2="21" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.7" />
              <line x1="7" y1="21" x2="21" y2="21" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.4" />
            </svg>
            <span className="font-display font-extrabold text-xl gradient-text">CreatiAI</span>
          </button>
          <nav className="hidden md:flex items-center gap-1">
            {['Workspace', 'Library', 'Explore'].map((tab) => (
              <button
                key={tab}
                onClick={() => navigate(`/${tab.toLowerCase()}`)}
                className={`px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                  tab === 'Workspace'
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
            aria-label="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[var(--border)] hover:ring-[var(--purple)] transition-all"
            aria-label="Profile"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full bg-[var(--purple)]/30 flex items-center justify-center text-xs font-display text-[var(--purple)]">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="font-display font-extrabold text-4xl text-[var(--text-primary)] tracking-tight">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
            </h1>
            <p className="mt-2 font-body text-lg text-[var(--text-secondary)]">
              {projects.length === 0
                ? 'Create your first project to get started.'
                : `${projects.length} project${projects.length !== 1 ? 's' : ''} in your workspace.`}
            </p>
          </div>
          <Button variant="gradient" size="lg" onClick={() => setShowNew(true)} leftIcon={<span>+</span>}>
            New Project
          </Button>
        </div>

        {/* New project dialog */}
        <AnimatePresence>
          {showNew && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="mb-8 glass rounded-2xl p-6"
            >
              <p className="font-body font-medium text-[var(--text-primary)] mb-4">
                Give your project a name
              </p>
              <div className="flex gap-3">
                <input
                  ref={newInputRef}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') setShowNew(false);
                  }}
                  placeholder="e.g. Brand Rebrand Q3, Novel Chapter 1, ..."
                  className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)]"
                />
                <Button variant="gradient" onClick={handleCreate} isLoading={creating} disabled={!newTitle.trim()}>
                  Create
                </Button>
                <Button variant="ghost" onClick={() => { setShowNew(false); setNewTitle(''); }}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent projects */}
        {recentProjects.length > 0 && !search && (
          <section className="mb-12">
            <h2 className="font-display font-bold text-sm text-[var(--text-muted)] uppercase tracking-widest mb-6">
              Recently opened
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recentProjects.map((project, i) => (
                <motion.button
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => navigate(`/workspace/${project.id}`)}
                  className="group text-left p-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--purple)]/50 hover:shadow-[0_10px_40px_-10px_rgba(147,51,234,0.15)] transition-all duration-300"
                >
                  {/* Canvas thumbnail placeholder */}
                  <div className="w-full h-32 rounded-2xl mb-5 overflow-hidden bg-[var(--bg-page)] relative border border-[var(--border)]">
                    <div className="absolute inset-0 canvas-grid opacity-30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--purple)]/20 to-[var(--cyan)]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xl text-[var(--purple)]">✦</span>
                      </div>
                    </div>
                  </div>
                  <p className="font-display font-bold text-lg text-[var(--text-primary)] truncate group-hover:text-[var(--purple)] transition-colors">
                    {project.name}
                  </p>
                  <p className="mt-1.5 font-body text-sm text-[var(--text-muted)]">
                    {(project.collaborators?.length ?? 0) > 0
                      ? `${project.collaborators!.length} collaborator${project.collaborators!.length !== 1 ? 's' : ''} · `
                      : ''}
                    Updated {formatRelative(project.updatedAt)}
                  </p>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* All projects */}
        <section>
          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)] transition-colors"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="px-3 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl text-sm font-body text-[var(--text-secondary)] focus:outline-none focus:border-[var(--purple)] cursor-pointer"
              aria-label="Sort by"
            >
              <option value="updatedAt">Last modified</option>
              <option value="createdAt">Created date</option>
              <option value="name">Title A–Z</option>
            </select>
            <div className="flex items-center gap-1 p-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl">
              {(['grid', 'list'] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    view === v ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                  }`}
                  aria-label={`${v} view`}
                >
                  {v === 'grid' ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
                      <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="1" y1="4" x2="15" y2="4"/><line x1="1" y1="8" x2="15" y2="8"/><line x1="1" y1="12" x2="15" y2="12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className={view === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`skeleton rounded-2xl ${view === 'grid' ? 'h-48' : 'h-14'}`} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-6"
            >
              {emptyIllustration}
              <div className="text-center">
                <p className="font-body font-medium text-[var(--text-primary)]">
                  {search ? 'No projects found' : 'No projects yet'}
                </p>
                <p className="mt-1 font-body text-sm text-[var(--text-muted)]">
                  {search ? 'Try a different search term.' : 'Hit "New Project" to create your first canvas.'}
                </p>
              </div>
              {!search && (
                <Button variant="gradient" onClick={() => setShowNew(true)} leftIcon={<span>+</span>}>
                  Create Project
                </Button>
              )}
            </motion.div>
          )}

          {/* Grid view */}
          {!loading && filteredProjects.length > 0 && view === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProjects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  onOpen={() => navigate(`/workspace/${project.id}`)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          )}

          {/* List view */}
          {!loading && filteredProjects.length > 0 && view === 'list' && (
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
              {filteredProjects.map((project, i) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  index={i}
                  total={filteredProjects.length}
                  onOpen={() => navigate(`/workspace/${project.id}`)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ProjectCard({ project, index, onOpen, onDelete }: {
  project: Project;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:border-[var(--purple)]/40 hover:shadow-[0_10px_30px_-10px_rgba(147,51,234,0.1)] transition-all duration-300 cursor-pointer"
      onClick={onOpen}
    >
      {/* Thumbnail */}
      <div className="w-full h-40 bg-[var(--bg-page)] relative border-b border-[var(--border)]">
        <div className="absolute inset-0 canvas-grid opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--purple)]/20 to-[var(--cyan)]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <span className="text-xl text-[var(--purple)]">✦</span>
          </div>
        </div>
      </div>
      {/* Info */}
      <div className="p-5">
        <p className="font-display font-bold text-lg text-[var(--text-primary)] truncate group-hover:text-[var(--purple)] transition-colors">{project.name}</p>
        <p className="mt-1.5 font-body text-sm text-[var(--text-muted)]">
          {formatRelative(project.updatedAt)}
        </p>
      </div>
      {/* Context menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--purple)] text-[var(--text-muted)]"
            aria-label="Project options"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                className="absolute right-0 top-8 w-40 glass rounded-xl border border-[var(--border)] overflow-hidden z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setShowMenu(false); onOpen(); }}
                  className="w-full px-4 py-2.5 text-left text-sm font-body text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
                >
                  <span>🖊</span> Open
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(); }}
                  className="w-full px-4 py-2.5 text-left text-sm font-body text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <span>🗑</span> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectRow({ project, index, total, onOpen, onDelete }: {
  project: Project;
  index: number;
  total: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className={`group flex items-center gap-5 px-6 py-5 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors ${
        index < total - 1 ? 'border-b border-[var(--border)]' : ''
      }`}
      onClick={onOpen}
    >
      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:border-[var(--purple)]/50 transition-colors">
        <span className="text-lg text-[var(--purple)]">✦</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-lg text-[var(--text-primary)] truncate group-hover:text-[var(--purple)] transition-colors">{project.name}</p>
        <p className="font-body text-sm text-[var(--text-muted)] mt-1">Updated {formatRelative(project.updatedAt)}</p>
      </div>
      {(project.collaborators?.length ?? 0) > 0 ? (
        <span className="font-mono text-sm text-[var(--text-muted)] hidden sm:block">
          {project.collaborators!.length} collaborator{project.collaborators!.length !== 1 ? 's' : ''}
        </span>
      ) : null}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-2 rounded-xl text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Delete project"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
        </svg>
      </button>
    </motion.div>
  );
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
