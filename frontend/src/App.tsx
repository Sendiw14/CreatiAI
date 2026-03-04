import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useUserStore } from './stores/userStore';

// Lazy-loaded pages — code split per route
const LandingPage = lazy(() => import('./pages/LandingPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const WorkspaceHub = lazy(() => import('./pages/workspace/WorkspaceHub'));
const CreativeCanvas = lazy(() => import('./pages/workspace/CreativeCanvas'));

// Auth pages (named exports)
const LoginPage = lazy(() => import('./pages/auth/AuthPages').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/auth/AuthPages').then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/AuthPages').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/AuthPages').then((m) => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('./pages/auth/AuthPages').then((m) => ({ default: m.VerifyEmailPage })));

// Other pages
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const PreferencesPage = lazy(() => import('./pages/profile/PreferencesPage'));
const LearningPage = lazy(() => import('./pages/profile/LearningPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const VersionHistoryPage = lazy(() => import('./pages/workspace/VersionHistoryPage'));
const SessionReplayPage = lazy(() => import('./pages/workspace/SessionReplayPage'));
const ExportPage = lazy(() => import('./pages/workspace/ExportPage'));
const CollaboratePage = lazy(() => import('./pages/workspace/CollaboratePage'));
const ShareViewPage = lazy(() => import('./pages/ShareViewPage'));

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminGovernance = lazy(() => import('./pages/admin/AdminGovernance'));
const AdminFlags = lazy(() => import('./pages/admin/AdminFlags'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit'));
const AdminBilling = lazy(() => import('./pages/admin/AdminBilling'));

// Error page
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'));

// Legal & contact pages
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useUserStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/workspace" replace />;
  return <>{children}</>;
}

function RequireOnboarded({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useUserStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (!user?.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--purple)] border-t-transparent animate-spin" />
        <p className="font-mono text-sm text-[var(--text-muted)]">Loading…</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageTransition>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/share/:token" element={<ShareViewPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />

          <Route path="/workspace" element={<RequireOnboarded><WorkspaceHub /></RequireOnboarded>} />
          <Route path="/workspace/:id" element={<RequireOnboarded><CreativeCanvas /></RequireOnboarded>} />
          <Route path="/workspace/:id/history" element={<RequireOnboarded><VersionHistoryPage /></RequireOnboarded>} />
          <Route path="/workspace/:id/replay" element={<RequireOnboarded><SessionReplayPage /></RequireOnboarded>} />
          <Route path="/workspace/:id/export" element={<RequireOnboarded><ExportPage /></RequireOnboarded>} />
          <Route path="/workspace/:id/collaborate" element={<RequireOnboarded><CollaboratePage /></RequireOnboarded>} />

          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/profile/preferences" element={<RequireAuth><PreferencesPage /></RequireAuth>} />
          <Route path="/profile/learning" element={<RequireAuth><LearningPage /></RequireAuth>} />

          <Route path="/library" element={<RequireOnboarded><LibraryPage /></RequireOnboarded>} />
          <Route path="/explore" element={<RequireOnboarded><ExplorePage /></RequireOnboarded>} />
          <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />

          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="governance" element={<AdminGovernance />} />
            <Route path="flags" element={<AdminFlags />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="billing" element={<AdminBilling />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageTransition>
    </Suspense>
  );
}

export default function App() {
  const { fetchMe, isAuthenticated } = useUserStore();
  const isDemo = typeof window !== 'undefined' && localStorage.getItem('creatiai-demo') === 'true';

  useEffect(() => {
    if (isAuthenticated) fetchMe().catch(() => { });
  }, [isAuthenticated, fetchMe]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />

        {/* Demo mode floating indicator */}
        {isDemo && isAuthenticated && (
          <div className="fixed bottom-4 left-4 z-[100] flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 backdrop-blur-md shadow-[0_0_20px_rgba(217,119,6,0.15)]">
            <span className="text-[var(--gold)] text-sm animate-pulse">✦</span>
            <span className="font-mono text-xs font-bold text-[var(--gold)]">Demo Mode</span>
          </div>
        )}

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              borderRadius: '12px',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
