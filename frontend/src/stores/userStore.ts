import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AIPreferences, CreativityProfile, AdaptiveMode } from '../types';
import api from '../lib/api';

const defaultPreferences: AIPreferences = {
  assertiveness: 3,
  responseStyle: 'collaborative',
  confidenceDisplay: 'always',
  uncertaintyCommunication: 'inline',
  showSelfCritique: true,
  showPromptEvolution: false,
  showInfluenceChain: true,
  defaultRandomness: 'balanced',
  whatIfModeDefault: 'opt-in',
  fallbackBehavior: 'notify',
  showAlternativePaths: true,
  maxResponseLength: 'medium',
  enableSessionLearning: true,
  enableCrossSessionLearning: true,
  learningDomains: ['tone', 'structure', 'domain', 'collaboration'],
  notifyAISuggestions: true,
  notifyCollaborators: true,
  notifyVersionSaved: true,
};

interface UserStore {
  user: User | null;
  creativityProfile: CreativityProfile | null;
  preferences: AIPreferences;
  mode: AdaptiveMode;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => void;
  loginWithGoogle: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updatePreferences: (prefs: Partial<AIPreferences>) => Promise<void>;
  toggleMode: () => void;
  setUser: (user: User | null) => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      creativityProfile: null,
      preferences: defaultPreferences,
      mode: 'novice',
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/api/auth/login', { email, password });
          localStorage.setItem('accessToken', data.accessToken);
          set({
            user: data.user,
            preferences: data.user.preferences || defaultPreferences,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      demoLogin: () => {
        const demoUser: User = {
          id: 'demo-user-001',
          email: 'demo@creatiai.com',
          name: 'Alex Demo',
          displayName: 'Alex Demo',
          handle: 'alexdemo',
          avatarUrl: undefined,
          role: 'admin',
          workspaceId: 'demo-ws-001',
          projectIds: ['demo-proj-1', 'demo-proj-2', 'demo-proj-3'],
          preferences: defaultPreferences,
          aiPersonality: 'creative',
          mode: 'expert',
          profile: {
            bio: 'Creative director exploring the intersection of AI and design.',
            website: 'https://creatiai.com',
            location: 'San Francisco, CA',
          },
          onboardingComplete: true,
          verified: true,
          createdAt: '2025-06-15T10:00:00.000Z',
          lastActiveAt: new Date().toISOString(),
        };
        localStorage.setItem('accessToken', 'demo-token');
        localStorage.setItem('creatiai-demo', 'true');
        set({
          user: demoUser,
          preferences: defaultPreferences,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      loginWithGoogle: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/api/auth/oauth/google', { code });
          localStorage.setItem('accessToken', data.accessToken);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'OAuth failed';
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        const isDemo = localStorage.getItem('creatiai-demo') === 'true';
        if (!isDemo) {
          try {
            await api.post('/api/auth/logout');
          } catch {
            // ignore
          }
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('creatiai-demo');
        localStorage.removeItem('creatiai-demo-projects');
        set({ user: null, isAuthenticated: false, preferences: defaultPreferences });
      },

      signup: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/api/auth/signup', { email, password, name });
          localStorage.setItem('accessToken', data.accessToken);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Signup failed';
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      fetchMe: async () => {
        // Skip API call in demo mode — user is already set
        if (localStorage.getItem('creatiai-demo') === 'true') return;
        try {
          const { data } = await api.get('/api/users/me');
          set({
            user: data,
            preferences: data.preferences || get().preferences,
            isAuthenticated: true,
          });
        } catch {
          localStorage.removeItem('accessToken');
          set({ user: null, isAuthenticated: false });
        }
      },

      updateProfile: async (updates) => {
        if (localStorage.getItem('creatiai-demo') === 'true') {
          const current = get().user;
          set({ user: current ? { ...current, ...updates } as User : null });
          return;
        }
        const { data } = await api.patch('/api/users/me', updates);
        set({ user: data });
      },

      updatePreferences: async (prefs) => {
        const merged = { ...get().preferences, ...prefs };
        if (localStorage.getItem('creatiai-demo') !== 'true') {
          await api.patch('/api/users/me', { preferences: merged });
        }
        set({ preferences: merged });
      },

      toggleMode: () => {
        set((s) => ({ mode: s.mode === 'novice' ? 'expert' : 'novice' }));
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      refreshToken: async () => {
        const { data } = await api.post('/api/auth/refresh');
        localStorage.setItem('accessToken', data.accessToken);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'creatiai-user',
      partialize: (s) => ({ mode: s.mode, preferences: s.preferences }),
    }
  )
);
