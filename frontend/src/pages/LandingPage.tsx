import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useInView, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useUserStore } from '../stores/userStore';

// ── Animated gradient mesh background ──────────────────────
function GradientMesh() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute w-[800px] h-[800px] bg-[var(--purple)]/20 blur-[120px] rounded-full mix-blend-screen top-[-200px] left-[-200px] animate-[pulse_10s_ease-in-out_infinite]"
      />
      <div
        className="absolute w-[600px] h-[600px] bg-[var(--cyan)]/20 blur-[120px] rounded-full mix-blend-screen top-[30%] right-[-100px] animate-[pulse_12s_ease-in-out_infinite_2s]"
      />
      <div
        className="absolute w-[500px] h-[500px] bg-[var(--gold)]/15 blur-[120px] rounded-full mix-blend-screen bottom-[-100px] left-[20%] animate-[pulse_14s_ease-in-out_infinite_4s]"
      />
      {/* SVG noise texture overlay */}
      <svg className="fixed inset-0 w-full h-full opacity-[0.04] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}

// ── Logo component ──────────────────────────────────────────
function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  return (
    <Link to="/" className="flex items-center gap-3 group">
      {/* Node graph icon */}
      <div className="relative w-8 h-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple)] to-[var(--cyan)] rounded-xl blur-[8px] opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
        <div className="relative w-full h-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center shadow-inner">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform duration-500">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--purple)" />
                <stop offset="55%" stopColor="var(--cyan)" />
                <stop offset="100%" stopColor="var(--gold)" />
              </linearGradient>
            </defs>
            <circle cx="7" cy="21" r="4" fill="url(#logoGrad)" />
            <circle cx="14" cy="7" r="4" fill="url(#logoGrad)" />
            <circle cx="21" cy="21" r="4" fill="url(#logoGrad)" />
            <line x1="7" y1="21" x2="14" y2="7" stroke="url(#logoGrad)" strokeWidth="2" opacity="0.8" />
            <line x1="14" y1="7" x2="21" y2="21" stroke="url(#logoGrad)" strokeWidth="2" opacity="0.8" />
            <line x1="7" y1="21" x2="21" y2="21" stroke="url(#logoGrad)" strokeWidth="2" opacity="0.5" />
          </svg>
        </div>
      </div>
      <span className={`font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight ${textSize}`}>CreatiAI</span>
    </Link>
  );
}

// ── Sticky Navbar ───────────────────────────────────────────
function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 50));
    return unsub;
  }, [scrollY]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { label: 'Product', id: 'product' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Explore', id: 'explore' },
    { label: 'Blog', id: 'blog' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex flex-col transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'
        }`}
    >
      {/* Glassmorphic background that fades in */}
      <div className={`absolute inset-0 transition-all duration-500 ${scrolled || mobileMenuOpen ? 'bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' : 'bg-transparent'
        }`} />

      <div className="relative z-10 flex items-center justify-between w-full max-w-7xl mx-auto">
        <Logo />
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1 backdrop-blur-md">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={`#${link.id}`}
              className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth/login" className="text-sm font-bold text-white/70 hover:text-white transition-colors duration-300 hidden sm:block">
            Log in
          </Link>
          <Link to="/auth/signup" className="hidden sm:block">
            <Button variant="gradient" size="sm" className="shadow-[0_0_20px_rgba(157,78,221,0.3)] hover:shadow-[0_0_30px_rgba(157,78,221,0.5)] font-bold px-6">
              Start free
            </Button>
          </Link>
          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'}`} />
              <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-2 pt-6 pb-4 px-4 max-w-7xl mx-auto">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={`#${link.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-4 py-3 rounded-xl text-base font-medium text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="h-px bg-white/10 my-2" />
              <div className="flex flex-col gap-3 px-4 pb-2">
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-center text-sm font-bold text-white/70 hover:text-white transition-colors duration-300 rounded-xl border border-white/10 bg-white/5"
                >
                  Log in
                </Link>
                <Link to="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="gradient" fullWidth size="sm" className="shadow-[0_0_20px_rgba(157,78,221,0.3)] font-bold">
                    Start free
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ── Hero interactive canvas preview ────────────────────────
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resize
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const nodes = [
      { x: 0.2, y: 0.4, label: 'Core Idea', phase: 0, color: '#9333EA' },
      { x: 0.5, y: 0.2, label: 'Creative Thread', phase: 1, color: '#0891B2' },
      { x: 0.8, y: 0.5, label: 'Insight', phase: 2, color: '#D97706' },
      { x: 0.35, y: 0.75, label: 'What-if?', phase: 3, color: '#0891B2' },
      { x: 0.65, y: 0.8, label: 'Next Step', phase: 4, color: '#9333EA' },
    ];

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.005;

      const w = canvas.width;
      const h = canvas.height;

      // Draw edges
      const edges = [[0, 1], [1, 2], [0, 3], [2, 4], [3, 4]];
      for (const [a, b] of edges) {
        const na = nodes[a];
        const nb = nodes[b];
        const ax = na.x * w + Math.sin(t + na.phase) * 15;
        const ay = na.y * h + Math.cos(t + na.phase) * 15;
        const bx = nb.x * w + Math.sin(t + nb.phase) * 15;
        const by = nb.y * h + Math.cos(t + nb.phase) * 15;

        // Animated gradient line
        const grad = ctx.createLinearGradient(ax, ay, bx, by);
        grad.addColorStop(0, `${na.color}40`); // 40 is hex for 25% opacity
        grad.addColorStop(0.5, `rgba(255,255,255,${0.1 + Math.sin(t * 3 + na.phase) * 0.1})`);
        grad.addColorStop(1, `${nb.color}40`);

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        // Smooth bezier curve
        const cp1x = ax + (bx - ax) * 0.5;
        const cp1y = ay;
        const cp2x = ax + (bx - ax) * 0.5;
        const cp2y = by;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, bx, by);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw moving particles along the path
        const particleT = (t * 0.5 + na.phase * 0.2) % 1;
        // Simple bezier interpolation for particle
        const px = Math.pow(1 - particleT, 3) * ax + 3 * Math.pow(1 - particleT, 2) * particleT * cp1x + 3 * (1 - particleT) * Math.pow(particleT, 2) * cp2x + Math.pow(particleT, 3) * bx;
        const py = Math.pow(1 - particleT, 3) * ay + 3 * Math.pow(1 - particleT, 2) * particleT * cp1y + 3 * (1 - particleT) * Math.pow(particleT, 2) * cp2y + Math.pow(particleT, 3) * by;

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();
        ctx.shadowColor = 'rgba(255,255,255,0.5)';
        ctx.shadowBlur = 5;
        ctx.shadowBlur = 0; // reset
      }

      // Draw nodes
      for (const node of nodes) {
        const nx = node.x * w + Math.sin(t + node.phase) * 15;
        const ny = node.y * h + Math.cos(t + node.phase) * 15;
        const pulse = 1 + Math.sin(t * 2 + node.phase) * 0.02;
        const width = 120 * pulse;
        const height = 44 * pulse;

        // Node glow
        const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, width);
        glow.addColorStop(0, `${node.color}20`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(nx, ny, width, 0, Math.PI * 2);
        ctx.fill();

        // Card background (glassmorphic)
        ctx.beginPath();
        ctx.roundRect(nx - width / 2, ny - height / 2, width, height, 12);
        ctx.fillStyle = 'rgba(15, 15, 20, 0.7)';
        ctx.fill();

        // Gradient border
        const borderGrad = ctx.createLinearGradient(nx - width / 2, ny - height / 2, nx + width / 2, ny + height / 2);
        borderGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
        borderGrad.addColorStop(0.5, `${node.color}80`);
        borderGrad.addColorStop(1, 'rgba(255,255,255,0.05)');
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node indicator dot
        ctx.beginPath();
        ctx.arc(nx - width / 2 + 16, ny, 4, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Dot glow
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label text
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '600 12px "Inter", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, nx - width / 2 + 28, ny);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-label="Interactive canvas preview showing connected idea nodes"
    />
  );
}

// ── Feature Section ─────────────────────────────────────────
interface FeatureSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  visual: React.ReactNode;
  reverse?: boolean;
  badge?: string;
}

function FeatureSection({ eyebrow, title, description, visual, reverse, badge }: FeatureSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col md:flex-row items-center gap-16 py-32 max-w-7xl mx-auto px-6 ${reverse ? 'md:flex-row-reverse' : ''
        }`}
    >
      <div className="flex-1 space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: reverse ? 20 : -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] animate-pulse" />
          <span className="text-xs font-mono font-medium text-[var(--text-muted)] uppercase tracking-widest">
            {eyebrow}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-display font-bold text-4xl md:text-5xl text-white leading-tight tracking-tight"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-body text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-xl"
        >
          {description}
        </motion.p>

        {badge && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-[var(--gold)] font-mono text-xs font-bold shadow-[0_0_15px_rgba(255,215,0,0.15)]"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            {badge}
          </motion.span>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotateY: reverse ? -5 : 5 }}
        animate={inView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.8, type: 'spring', stiffness: 100 }}
        className="flex-1 w-full h-[400px] rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative group perspective-1000"
      >
        {/* Decorative glow behind visual */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full blur-[80px] opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-40 ${reverse ? 'bg-[var(--cyan)]' : 'bg-[var(--purple)]'
          }`} />

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {visual}
        </div>

        {/* Glass reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />
      </motion.div>
    </motion.section>
  );
}

// ── Pricing Card ────────────────────────────────────────────
interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  recommended?: boolean;
  enterprise?: boolean;
}

function PricingCard({ name, price, period, features, cta, recommended, enterprise }: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative rounded-3xl p-8 flex flex-col gap-8 backdrop-blur-xl transition-all duration-500 ${recommended
        ? 'bg-white/10 shadow-[0_20px_50px_rgba(157,78,221,0.2)]'
        : 'bg-black/40 hover:bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
        }`}
      style={
        recommended
          ? {
            border: '1px solid rgba(157,51,234,0.5)',
          }
          : enterprise
            ? { border: '1px solid rgba(217,119,6,0.3)', boxShadow: '0 10px 30px -10px rgba(217,119,6,0.1)' }
            : { border: '1px solid rgba(255,255,255,0.1)' }
      }
    >
      {recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest text-white shadow-[0_0_20px_rgba(157,78,221,0.5)]"
          style={{ background: 'linear-gradient(90deg, var(--purple), var(--cyan))' }}>
          RECOMMENDED
        </div>
      )}

      {/* Background Glow for Recommended */}
      {recommended && (
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--purple)]/10 to-transparent rounded-3xl pointer-events-none" />
      )}

      <div className="relative z-10">
        <h3 className={`font-display font-bold text-2xl ${enterprise ? 'text-[var(--gold)]' : 'text-white'}`}>{name}</h3>
        <div className="mt-4 flex items-baseline gap-2">
          <span className={`font-display font-extrabold text-5xl ${recommended ? 'text-transparent bg-clip-text bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)]' : 'text-white'}`}>{price}</span>
          {period && <span className="text-[var(--text-muted)] font-body text-sm font-medium">{period}</span>}
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-white/20 via-white/10 to-transparent my-2 relative z-10" />

      <ul className="space-y-5 flex-1 relative z-10">
        {features.map((f, i) => (
          <motion.li
            key={f}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 font-body text-sm text-[var(--text-secondary)] group"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300 ${recommended ? 'bg-[var(--purple)]/20 text-[var(--purple)] group-hover:bg-[var(--purple)]/40' :
              enterprise ? 'bg-[var(--gold)]/20 text-[var(--gold)] group-hover:bg-[var(--gold)]/40' :
                'bg-white/10 text-white group-hover:bg-white/20'
              }`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span className="leading-relaxed group-hover:text-white transition-colors duration-300">{f}</span>
          </motion.li>
        ))}
      </ul>

      <Link to={enterprise ? '/contact' : '/auth/signup'} className="mt-6 relative z-10">
        <Button
          variant={recommended ? 'gradient' : enterprise ? 'gold' : 'ghost'}
          fullWidth
          size="lg"
          className={`py-6 text-base font-bold ${!recommended && !enterprise ? 'border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white' : 'shadow-[0_0_20px_rgba(157,78,221,0.3)] hover:shadow-[0_0_30px_rgba(157,78,221,0.5)]'}`}
        >
          {cta}
        </Button>
      </Link>
    </motion.div>
  );
}

// ── FAQ ─────────────────────────────────────────────────────
const faqs = [
  {
    q: 'How is this different from ChatGPT?',
    a: 'CreatiAI is a spatial co-creator, not a chatbot. Ideas live on a canvas with version history, confidence scores, and explainability. The AI thinks alongside you — it knows your creative context, challenges assumptions, and evolves with your voice.',
  },
  {
    q: 'Does CreatiAI own my ideas?',
    a: 'Never. You own everything you create. We have no rights to your content. Your data is yours, and you can export everything at any time.',
  },
  {
    q: 'Can I use it offline?',
    a: 'Your canvas reads and writes offline via IndexedDB. AI features require connectivity, but your work auto-syncs when you reconnect.',
  },
  {
    q: 'What AI models power it?',
    a: 'CreatiAI uses Claude (claude-sonnet-4-6) for all co-creation responses, with claude-haiku-4-5 as a smart fallback. You can see the active model in the bottom bar.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Your prompts and canvas data are not used to train any AI models, including Anthropic\'s. Learning data (if opt-in) stays within your workspace only.',
  },
  {
    q: 'Can I export everything?',
    a: 'Absolutely. Export your canvas as PDF, PNG, Markdown, JSON, or share via link. Full data export available at any time.',
  },
  {
    q: 'How does team collaboration work?',
    a: 'Real-time editing with live cursors, presence indicators, comment threads, session replay, and role-based access. Everything syncs instantly.',
  },
  {
    q: 'What happens if AI is offline?',
    a: 'A clear status indicator shows AI availability. Your canvas stays fully functional. Cached suggestions may surface, and AI resumes automatically when back online.',
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  return (
    <section className="max-w-4xl mx-auto px-6 py-32 relative" id="faq">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[var(--cyan)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="text-center mb-20 space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
        >
          <span className="text-xs font-mono font-medium text-[var(--text-muted)] uppercase tracking-widest">
            Got Questions?
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display font-bold text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight"
        >
          Frequently asked questions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-body text-xl text-[var(--text-secondary)] max-w-2xl mx-auto"
        >
          Everything you need to know about the platform and how it works.
        </motion.p>
      </div>

      <div className="space-y-4 relative z-10">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-3xl border backdrop-blur-xl overflow-hidden transition-all duration-500 ${openIndex === i
              ? 'border-[var(--purple)]/50 bg-white/10 shadow-[0_10px_30px_rgba(157,78,221,0.15)]'
              : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/30'
              }`}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-8 py-6 text-left focus:outline-none group"
              aria-expanded={openIndex === i}
            >
              <span className={`font-display font-semibold text-xl transition-colors duration-300 ${openIndex === i ? 'text-white' : 'text-white/90 group-hover:text-white'
                }`}>{faq.q}</span>
              <motion.div
                animate={{
                  rotate: openIndex === i ? 180 : 0,
                  backgroundColor: openIndex === i ? 'rgba(157,78,221,0.2)' : 'rgba(255,255,255,0.05)',
                  borderColor: openIndex === i ? 'rgba(157,78,221,0.5)' : 'rgba(255,255,255,0.1)'
                }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                className="w-10 h-10 rounded-full border flex items-center justify-center text-white shrink-0 shadow-inner"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-8 pt-2">
                    <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent mb-6" />
                    <p className="font-body text-[var(--text-secondary)] leading-relaxed text-lg">
                      {faq.a}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Cookie Consent Banner ───────────────────────────────────
function CookieBanner({ onAccept, onCustomize }: { onAccept: () => void; onCustomize: () => void }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 100, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-lg z-50 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍪</span>
          <h4 className="font-display font-bold text-white">Cookie Preferences</h4>
        </div>
        <p className="font-body text-sm text-[var(--text-secondary)] leading-relaxed">
          We use cookies to improve your experience. No tracking without consent. Your privacy is our priority.
        </p>
      </div>
      <div className="flex gap-3 shrink-0 w-full sm:w-auto">
        <button onClick={onCustomize} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
          Customize
        </button>
        <button onClick={onAccept} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] shadow-[0_0_15px_rgba(157,78,221,0.3)] hover:shadow-[0_0_25px_rgba(157,78,221,0.5)] hover:-translate-y-0.5 transition-all duration-300">
          Accept All
        </button>
      </div>
    </motion.div>
  );
}

// ── Footer ──────────────────────────────────────────────────
function Footer() {
  const cols: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: 'Product',
      links: [
        { label: 'Canvas', href: '#product' },
        { label: 'Collaboration', href: '#explore' },
        { label: 'Library', href: '/auth/signup' },
        { label: 'Explore', href: '#explore' },
        { label: 'Pricing', href: '#pricing' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#product' },
        { label: 'Blog', href: '#blog' },
        { label: 'Careers', href: '/contact' },
        { label: 'Press', href: '/contact' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Developers',
      links: [
        { label: 'API Docs', href: '#' },
        { label: 'Status', href: '#' },
        { label: 'Changelog', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Cookie Policy', href: '/privacy' },
        { label: 'Security', href: '/privacy' },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-white/10 mt-32 overflow-hidden bg-black/20 backdrop-blur-xl">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[var(--purple)]/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-2 md:grid-cols-6 gap-12 relative z-10">
        <div className="col-span-2 space-y-8">
          <Logo size="lg" />
          <p className="font-body text-lg text-[var(--text-secondary)] leading-relaxed max-w-sm">
            An AI co-creator that thinks with you, not for you. Build the future of creativity together.
          </p>
          <div className="flex gap-4 pt-2">
            {[
              { icon: '𝕏', label: 'Twitter', href: 'https://twitter.com/creatiai' },
              { icon: 'in', label: 'LinkedIn', href: 'https://linkedin.com/company/creatiai' },
              { icon: '◆', label: 'Discord', href: 'https://discord.gg/creatiai' },
              { icon: 'GH', label: 'GitHub', href: 'https://github.com/creatiai' },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--purple)]/50 hover:bg-[var(--purple)]/10 hover:text-white hover:shadow-[0_0_20px_rgba(147,51,234,0.2)] hover:-translate-y-1 transition-all duration-300 text-xl font-bold"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        {cols.map((col) => (
          <div key={col.title} className="space-y-6">
            <h4 className="font-display font-bold text-sm tracking-widest uppercase text-white/90">{col.title}</h4>
            <ul className="space-y-4">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-body text-base text-[var(--text-secondary)] hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        <span className="font-body text-sm font-medium text-[var(--text-muted)]">
          © 2026 CreatiAI. Built for thinkers.
        </span>
      </div>
    </footer>
  );
}

// ── Main Landing Page ───────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { demoLogin } = useUserStore();
  const [cookieAccepted, setCookieAccepted] = React.useState<boolean | null>(() => {
    const stored = localStorage.getItem('creatiai-cookies');
    return stored ? JSON.parse(stored) : null;
  });
  const [scrollY, setScrollY] = React.useState(0);
  const { scrollY: scrollYMotion } = useScroll();

  useEffect(() => {
    const unsub = scrollYMotion.on('change', (v) => setScrollY(v));
    return unsub;
  }, [scrollYMotion]);

  const handleAcceptCookies = () => {
    localStorage.setItem('creatiai-cookies', 'true');
    setCookieAccepted(true);
  };

  const handleCustomizeCookies = () => {
    localStorage.setItem('creatiai-cookies', 'false');
    setCookieAccepted(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] selection:bg-[var(--purple)]/30 selection:text-white">
      <a href="#canvas" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-white text-black font-bold rounded-lg">Skip to canvas</a>
      <GradientMesh />
      <Navbar />

      {/* ── Hero ── */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden"
      >
        {/* Hero background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--purple)]/10 blur-[150px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10 max-w-4xl relative z-10"
        >
          {/* Tag chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center"
          >
            <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(157,78,221,0.15)]">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] animate-pulse" />
              <span className="font-mono text-xs font-bold text-white/80 uppercase tracking-widest">
                Creative Intelligence Platform
              </span>
            </span>
          </motion.div>

          {/* Headline */}
          <h1
            className="font-display font-extrabold text-[clamp(3rem,8vw,6rem)] leading-[1.05] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60 drop-shadow-2xl"
          >
            Think together.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--purple)] via-[var(--cyan)] to-white">Create further.</span>
          </h1>

          {/* Sub */}
          <p className="font-body text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-light">
            CreatiAI is your intelligent creative partner — not a generator. An AI that thinks
            alongside you, challenges your ideas, and evolves with your creative voice.
          </p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4"
          >
            <Link to="/auth/signup" className="w-full sm:w-auto group">
              <Button
                variant="gradient"
                size="lg"
                className="w-full sm:w-auto py-6 px-8 text-lg font-bold shadow-[0_0_40px_rgba(157,78,221,0.4)] group-hover:shadow-[0_0_60px_rgba(157,78,221,0.6)] transition-all duration-500"
                rightIcon={<span className="group-hover:translate-x-1 transition-transform duration-300">→</span>}
              >
                Start Creating Free
              </Button>
            </Link>
            <button
              onClick={() => {
                document.getElementById('canvas')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl font-body font-bold flex items-center justify-center gap-3 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-300 group backdrop-blur-md"
            >
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs group-hover:scale-110 transition-transform duration-300 group-hover:bg-white/20">
                ▶
              </span>
              See it in action
            </button>
            <button
              onClick={() => { demoLogin(); navigate('/workspace'); }}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl font-body font-bold flex items-center justify-center gap-3 border border-[var(--gold)]/30 bg-[var(--gold)]/5 hover:bg-[var(--gold)]/15 hover:border-[var(--gold)]/50 text-[var(--gold)] transition-all duration-300 group backdrop-blur-md hover:shadow-[0_0_30px_rgba(217,119,6,0.2)]"
            >
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">✦</span>
              Try Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Hero canvas preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, type: 'spring', stiffness: 100 }}
          className="relative mt-24 w-full max-w-5xl h-[400px] md:h-[500px] rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.4)] group"
          id="canvas"
        >
          {/* Glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />

          <HeroCanvas />

          {/* Fade out bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-10 bg-gradient-to-t from-[var(--bg-page)] to-transparent" />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: scrollY > 50 ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-mono text-xs font-medium tracking-widest uppercase">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-1"
          >
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Social Proof Ticker ── */}
      <div className="border-y border-white/5 py-6 overflow-hidden bg-black/20 backdrop-blur-md relative z-10">
        <div
          className="flex gap-16 whitespace-nowrap items-center"
          style={{ animation: 'ticker 40s linear infinite' }}
        >
          {Array(3).fill(null).flatMap(() => [
            'Trusted by 12,000+ creators',
            <span className="text-[var(--purple)] text-xl">✦</span>,
            'Writers · Designers · Strategists · Researchers',
            <span className="text-[var(--cyan)] text-xl">✦</span>,
            '50K+ projects created',
            <span className="text-[var(--gold)] text-xl">✦</span>,
            'Real-time collaboration',
            <span className="text-[var(--purple)] text-xl">✦</span>,
            'Confidence-aware AI',
            <span className="text-[var(--cyan)] text-xl">✦</span>,
          ]).map((item, i) => (
            <span key={i} className="font-display font-bold text-lg text-white/40 uppercase tracking-wider">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Feature Sections ── */}
      <div id="product" className="scroll-mt-20" />
      <FeatureSection
        eyebrow="Spatial Canvas"
        title="A canvas that thinks with you"
        description="Your ideas live in space, not a chat thread. Connect thoughts, branch concepts, explore what-if scenarios — with an AI that understands context, not just keywords."
        visual={
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="space-y-4 w-full max-w-md relative">
              {/* Connecting lines */}
              <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-[var(--purple)] via-[var(--cyan)] to-[var(--gold)] opacity-30" />

              {['Core concept', 'Branch A', 'Branch B', 'Insight'].map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15, type: 'spring', stiffness: 100 }}
                  className="h-16 rounded-2xl border border-white/10 flex items-center px-6 gap-4 bg-white/5 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.2)] relative group hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                  style={{ marginLeft: `${i * 24}px` }}
                >
                  {/* Node connector dot */}
                  <div className="absolute -left-[29px] w-3 h-3 rounded-full border-2 border-[var(--bg-page)] shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ background: ['#9333EA', '#0891B2', '#D97706', '#0891B2'][i] }}
                  />

                  <div className="w-1.5 h-8 rounded-full shadow-[0_0_10px_currentColor]"
                    style={{ background: ['#9333EA', '#0891B2', '#D97706', '#0891B2'][i], color: ['#9333EA', '#0891B2', '#D97706', '#0891B2'][i] }}
                  />
                  <span className="font-display font-semibold text-lg text-white/90 group-hover:text-white transition-colors">{label}</span>
                  {i === 0 && (
                    <span className="ml-auto bg-[var(--cyan)]/10 text-[var(--cyan)] border border-[var(--cyan)]/30 text-xs px-2.5 py-1 rounded-md font-mono font-bold shadow-[0_0_15px_rgba(8,145,178,0.2)]">HIGH · 92</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        }
      />

      <FeatureSection
        reverse
        eyebrow="Radical Transparency"
        title="Transparent by design"
        description="Every AI response shows its confidence, reasoning, and influences. Expand 'Why this idea exists' to see exactly what shaped the suggestion — no black box."
        badge="SPECULATIVE"
        visual={
          <div className="w-full h-full p-8 flex flex-col gap-4 justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-white/10 p-6 space-y-4 bg-white/5 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.2)] relative overflow-hidden group"
            >
              {/* Subtle glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--cyan)]/10 blur-[40px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--cyan)] flex items-center justify-center shadow-[0_0_10px_rgba(157,78,221,0.3)]">
                    <span className="text-[10px] text-white">✦</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white/80">AI Co-Creator</span>
                </div>
                <span className="bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 text-[10px] px-2.5 py-1 rounded-md font-mono font-bold shadow-[0_0_15px_rgba(255,215,0,0.15)]">SPEC · 61</span>
              </div>
              <p className="font-body text-sm text-white/90 leading-relaxed relative z-10">
                This direction challenges the conventional framing — what if the constraint is the feature?
              </p>
              <div className="text-xs font-mono text-[var(--text-muted)] border-t border-white/10 pt-4 mt-2 flex items-center gap-2 group-hover:text-white/70 transition-colors cursor-pointer relative z-10">
                <span className="text-[10px]">▼</span> Why this idea exists
              </div>
            </motion.div>
          </div>
        }
      />

      <FeatureSection
        eyebrow="Version Intelligence"
        title="Ideas evolve, not disappear"
        description="Every version is saved. Name checkpoints, restore branches, see an AI-generated diff of what changed and why. Your creative history is a resource, not a burden."
        visual={
          <div className="w-full h-full p-8 flex flex-col justify-center relative">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />

            <div className="relative z-10 pl-8">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-white/5 via-white/20 to-[var(--cyan)]/50 rounded-full" />

              {[
                { label: 'v1.0 — Initial idea', active: false },
                { label: 'v1.3 — Reframed', active: false },
                { label: 'v2.0 Before pivot ⭐', active: false, highlight: true },
                { label: 'v2.4 — Current', active: true }
              ].map((v, i) => (
                <motion.div
                  key={v.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={`flex items-center gap-6 mb-6 relative group ${v.active ? 'opacity-100' : 'opacity-60 hover:opacity-100'} transition-opacity duration-300`}
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-[33px] w-4 h-4 rounded-full border-4 border-black/40 z-10 transition-all duration-300 ${v.active ? 'bg-[var(--cyan)] shadow-[0_0_15px_rgba(8,145,178,0.5)] scale-125' :
                    v.highlight ? 'bg-[var(--gold)] shadow-[0_0_10px_rgba(255,215,0,0.3)]' :
                      'bg-white/30 group-hover:bg-white/60'
                    }`} />

                  <div className={`px-4 py-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 ${v.active ? 'bg-[var(--cyan)]/10 border-[var(--cyan)]/30 shadow-[0_0_20px_rgba(8,145,178,0.15)]' :
                    'bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:border-white/20'
                    }`}>
                    <span className={`font-mono text-sm ${v.active ? 'text-white font-bold' : 'text-white/80'}`}>{v.label}</span>
                  </div>

                  {v.active && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[10px] text-[var(--cyan)] font-mono font-bold px-2 py-1 rounded bg-[var(--cyan)]/10 border border-[var(--cyan)]/20"
                    >
                      NOW
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        }
      />

      <div id="explore" className="scroll-mt-20" />
      <FeatureSection
        reverse
        eyebrow="Real-time Collaboration"
        title="Create with your team"
        description="Live cursors, real-time editing, comment threads anchored to ideas, and session replay. See exactly who changed what, when, and why — with full AI context."
        visual={
          <div className="w-full h-full p-6 relative">
            <div className="absolute inset-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
              {/* Mock canvas content */}
              <div className="absolute top-8 left-8 w-32 h-24 rounded-xl border border-white/10 bg-white/5" />
              <div className="absolute top-20 right-12 w-40 h-32 rounded-xl border border-[var(--purple)]/30 bg-[var(--purple)]/10" />
              <div className="absolute bottom-12 left-20 w-48 h-20 rounded-xl border border-[var(--cyan)]/30 bg-[var(--cyan)]/10" />

              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <path d="M 100 80 Q 150 80 200 120 T 280 120" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 100 150 Q 120 200 150 220 T 200 220" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
              </svg>

              {[
                { color: '#9333EA', x: '25%', y: '35%', name: 'Maya', delay: 0 },
                { color: '#0891B2', x: '65%', y: '50%', name: 'Alex', delay: 0.2 },
                { color: '#D97706', x: '45%', y: '70%', name: 'Sam', delay: 0.4 },
              ].map((cursor) => (
                <motion.div
                  key={cursor.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: [0, 10, -5, 0],
                    y: [0, -10, 5, 0]
                  }}
                  transition={{
                    opacity: { delay: cursor.delay, duration: 0.5 },
                    scale: { delay: cursor.delay, duration: 0.5, type: 'spring' },
                    x: { duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: cursor.delay },
                    y: { duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: cursor.delay }
                  }}
                  className="absolute flex items-center gap-2 z-20"
                  style={{ left: cursor.x, top: cursor.y }}
                >
                  <svg width="20" height="24" viewBox="0 0 16 20" fill={cursor.color} className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
                    <path d="M0 0L16 9L7 11L4 20L0 0Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  <span className="font-mono text-[10px] font-bold px-2 py-1 rounded-md shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                    style={{ background: cursor.color, color: 'white' }}>
                    {cursor.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        }
      />

      {/* ── Pricing ── */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-32 relative">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--purple)]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center mb-20 space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <span className="text-xs font-mono font-medium text-[var(--text-muted)] uppercase tracking-widest">
              Pricing
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-xl text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            Start free. Scale when you're ready.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <PricingCard
              name="Solo"
              price="$0"
              period="/month"
              features={[
                '3 projects',
                '50 AI calls/day',
                '1 user',
                '1GB storage',
                'Community support',
              ]}
              cta="Get started free"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <PricingCard
              name="Team"
              price="$29"
              period="/user/month"
              features={[
                'Unlimited projects',
                '500 AI calls/day',
                'Up to 25 users',
                '50GB storage',
                'Real-time collaboration',
                'Priority support',
              ]}
              cta="Start team trial"
              recommended
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <PricingCard
              name="Enterprise"
              price="Custom"
              features={[
                'Unlimited everything',
                'SSO & SAML',
                'Audit logs',
                'Custom AI models',
                'Dedicated support',
                'SLA guarantee',
              ]}
              cta="Contact sales"
              enterprise
            />
          </motion.div>
        </div>
      </section>

      {/* ── Blog placeholder anchor ── */}
      <div id="blog" className="scroll-mt-20" />

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── Footer ── */}
      <Footer />

      {/* ── Cookie Consent ── */}
      <AnimatePresence>
        {cookieAccepted === null && (
          <CookieBanner onAccept={handleAcceptCookies} onCustomize={handleCustomizeCookies} />
        )}
      </AnimatePresence>
    </div>
  );
}
