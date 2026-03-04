import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useUserStore } from '../../stores/userStore';
import toast from 'react-hot-toast';

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[40%] flex-col items-center justify-center p-12 relative border-r border-[var(--border)]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { x: '20%', y: '30%', label: 'Idea' },
            { x: '60%', y: '55%', label: 'Insight' },
            { x: '35%', y: '70%', label: 'Vision' },
          ].map((node, i) => (
            <motion.div
              key={node.label}
              className="absolute rounded-xl border border-[var(--border)] px-4 py-2 bg-[var(--bg-card)]"
              style={{ left: node.x, top: node.y }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
            >
              <span className="font-body text-xs text-[var(--text-muted)]">{node.label}</span>
            </motion.div>
          ))}
        </div>
        <div className="relative z-10 text-center space-y-8">
          <Link to="/" className="flex items-center justify-center gap-2">
            <span className="font-display font-extrabold text-2xl gradient-text">CreatiAI</span>
          </Link>
          <blockquote className="font-body italic text-[var(--text-secondary)] text-lg max-w-xs">
            "The best ideas happen in conversation."
          </blockquote>
          <div className="flex flex-col gap-2 items-center">
            {['✦ AI Co-Creator', '✦ Version History', '✦ Real-time Collab'].map((chip) => (
              <span
                key={chip}
                className="font-accent text-xs text-[var(--text-muted)] px-3 py-1 rounded-full border border-[var(--border)]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[400px] space-y-8">
          <Link to="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] flex items-center gap-1 transition-colors">
            ← Back to home
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Login Page ──────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const { login, demoLogin, isLoading, error, clearError } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/workspace');
    } catch {
      // error displayed via store
    }
  };

  const handleDemoLogin = () => {
    demoLogin();
    toast.success('Welcome to demo mode! Explore everything.', { icon: '✦', duration: 4000 });
    navigate('/workspace');
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <div>
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">
            Welcome back, creator.
          </h1>
          <p className="mt-2 font-body text-[var(--text-secondary)]">
            Continue your creative journey.
          </p>
        </div>

        {/* Demo Account Banner */}
        <motion.button
          onClick={handleDemoLogin}
          className="w-full relative overflow-hidden rounded-2xl p-[1px] group"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#9333EA] via-[#06B6D4] to-[#D97706] opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="relative rounded-[15px] bg-[var(--bg-page)] px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9333EA] to-[#06B6D4] flex items-center justify-center text-white text-lg shrink-0 shadow-lg">
              ✦
            </div>
            <div className="flex-1 text-left">
              <p className="font-display font-bold text-sm text-[var(--text-primary)]">
                Try Demo Account
              </p>
              <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
                Explore all features instantly — no signup needed
              </p>
            </div>
            <span className="text-[var(--text-muted)] group-hover:text-[var(--cyan)] group-hover:translate-x-1 transition-all text-lg">→</span>
          </div>
        </motion.button>

        <div className="relative flex items-center gap-4">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="font-body text-xs text-[var(--text-muted)]">or sign in with email</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            error={error && error.includes('email') ? error : undefined}
            leftIcon={<span className="text-sm">✉</span>}
          />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
            autoComplete="current-password"
            leftIcon={<span className="text-sm">🔒</span>}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-xs"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            }
          />

          {error && !error.includes('email') && (
            <p className="text-[var(--error)] text-sm font-body flex items-center gap-1" role="alert">
              ⚠ {error}
            </p>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-[var(--purple)] rounded"
              />
              <span className="font-body text-sm text-[var(--text-secondary)]">Remember me</span>
            </label>
            <Link
              to="/auth/forgot-password"
              className="font-body text-sm text-[var(--cyan)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="gradient" fullWidth size="lg" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="relative flex items-center gap-4">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="font-body text-xs text-[var(--text-muted)]">or continue with</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <button className="btn-ghost w-full h-11 rounded-xl flex items-center justify-center gap-3 font-body text-sm">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center font-body text-sm text-[var(--text-muted)]">
          New to CreatiAI?{' '}
          <Link to="/auth/signup" className="text-[var(--cyan)] hover:underline">
            Start creating →
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

// ── Signup Page ─────────────────────────────────────────────
export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useUserStore();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    agreeTerms: false, joiningTeam: false, inviteCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#EF4444', '#F59E0B', '#06B6D4', '#F59E0B'];
  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    clearError();
    try {
      await signup(form.email, form.password, form.name);
      setSubmitted(true);
    } catch {
      // error from store
    }
  };

  if (submitted) {
    return (
      <AuthLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl"
          >
            ✉
          </motion.div>
          <h2 className="font-display font-bold text-2xl text-[var(--text-primary)]">
            Check your inbox
          </h2>
          <p className="font-body text-[var(--text-secondary)]">
            We sent a verification link to <strong>{form.email}</strong>
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="font-body text-sm text-[var(--cyan)] hover:underline"
          >
            Back to Sign In
          </button>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <div>
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">
            Begin your creative journey.
          </h1>
          <p className="mt-2 font-body text-[var(--text-secondary)]">
            Join 12,000+ creators thinking with AI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Full name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            required
            leftIcon={<span className="text-sm">👤</span>}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            required
            leftIcon={<span className="text-sm">✉</span>}
          />
          <div className="space-y-1">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Create a strong password"
              required
              leftIcon={<span className="text-sm">🔒</span>}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--text-muted)] text-xs"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              }
            />
            {form.password && (
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full transition-colors duration-300"
                    style={{ background: i <= strength ? strengthColors[strength] : 'var(--border)' }}
                  />
                ))}
                <span className="ml-2 text-xs font-accent" style={{ color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>
          <Input
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="Repeat your password"
            required
            rightElement={
              form.confirm && form.password === form.confirm ? (
                <span className="text-[var(--success)] text-sm">✓</span>
              ) : null
            }
          />

          {error && (
            <p className="text-[var(--error)] text-sm font-body" role="alert">⚠ {error}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreeTerms}
              onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
              className="mt-0.5 accent-[var(--purple)]"
              required
            />
            <span className="font-body text-sm text-[var(--text-secondary)]">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-[var(--cyan)] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" className="text-[var(--cyan)] hover:underline">Privacy Policy</a>
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.joiningTeam}
              onChange={(e) => setForm({ ...form, joiningTeam: e.target.checked })}
              className="accent-[var(--purple)]"
            />
            <span className="font-body text-sm text-[var(--text-secondary)]">
              I'm joining a team workspace
            </span>
          </label>

          {form.joiningTeam && (
            <Input
              label="Workspace invite code"
              type="text"
              value={form.inviteCode}
              onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
              placeholder="Enter invite code"
            />
          )}

          <Button
            type="submit"
            variant="gradient"
            fullWidth
            size="lg"
            isLoading={isLoading}
            disabled={!form.agreeTerms}
          >
            Create Account
          </Button>
        </form>

        <div className="relative flex items-center gap-4">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="font-body text-xs text-[var(--text-muted)]">or continue with</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <button className="btn-ghost w-full h-11 rounded-xl flex items-center justify-center gap-3 font-body text-sm">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center font-body text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-[var(--cyan)] hover:underline">
            Sign in →
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

// ── Forgot Password ─────────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { default: api } = await import('../../lib/api');
      await api.post('/api/auth/forgot', { email });
      setSent(true);
    } catch {
      toast.error('Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {sent ? (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto">
                <motion.path
                  d="M8 16h48l-24 28L8 16z"
                  stroke="url(#envGrad)" strokeWidth="2" fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
                <defs>
                  <linearGradient id="envGrad">
                    <stop stopColor="#7C3AED" />
                    <stop offset="1" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
            <h2 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Reset link sent!
            </h2>
            <p className="font-body text-[var(--text-secondary)]">
              Check your inbox and your spam folder too.
            </p>
            <Link to="/auth/login" className="font-body text-sm text-[var(--cyan)] hover:underline">
              ← Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">
                Let's get you back.
              </h1>
              <p className="mt-2 font-body text-[var(--text-secondary)]">
                Enter your email and we'll send a reset link.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                leftIcon={<span className="text-sm">✉</span>}
              />
              <Button type="submit" variant="gradient" fullWidth size="lg" isLoading={loading}>
                Send Reset Link
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </AuthLayout>
  );
}

// ── Reset Password ──────────────────────────────────────────
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // Would use token from URL params in real implementation
      toast.success('Password reset! Redirecting…');
      setSuccess(true);
      setTimeout(() => navigate('/auth/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">
            Create a new password.
          </h1>
        </div>
        {success ? (
          <div className="text-center space-y-4">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-5xl block"
            >
              ✓
            </motion.span>
            <p className="font-body text-[var(--success)]">Password updated! Redirecting…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              leftIcon={<span className="text-sm">🔒</span>}
            />
            <Input
              label="Confirm password"
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
            />
            <Button type="submit" variant="gradient" fullWidth size="lg" isLoading={loading}>
              Reset Password
            </Button>
          </form>
        )}
      </motion.div>
    </AuthLayout>
  );
}

// ── Email Verification ──────────────────────────────────────
export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      // In real app: call API with token from URL
      setState('success');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthLayout>
      <div className="text-center space-y-8">
        {state === 'loading' && (
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <div className="text-5xl mb-4">🜃</div>
            <p className="font-body text-[var(--text-secondary)]">Verifying your email…</p>
          </motion.div>
        )}
        {state === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto">
              <motion.circle cx="40" cy="40" r="38" stroke="url(#checkGrad)" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
              <motion.path d="M24 40l12 12 20-24" stroke="url(#checkGrad)" strokeWidth="3" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
              <defs>
                <linearGradient id="checkGrad">
                  <stop stopColor="#7C3AED" />
                  <stop offset="1" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <h2 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Email verified! Welcome to CreatiAI.
            </h2>
            <Button variant="gradient" onClick={() => navigate('/workspace')}>
              Go to workspace →
            </Button>
          </motion.div>
        )}
        {state === 'error' && (
          <div className="space-y-6">
            <p className="text-[var(--error)] font-body">This link has expired.</p>
            <Button variant="ghost" onClick={() => setState('loading')}>
              Resend verification email
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
