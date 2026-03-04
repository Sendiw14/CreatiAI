import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIState } from '../types';

interface UIStore extends UIState {
  setMode: (mode: UIState['mode']) => void;
  toggleMode: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setRightPanelCollapsed: (collapsed: boolean) => void;
  setRightPanelTab: (tab: UIState['rightPanelTab']) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setNotificationPanelOpen: (open: boolean) => void;
  setSearchOverlayOpen: (open: boolean) => void;
  acceptCookies: () => void;
  customizeCookies: () => void;
  advanceOnboardingTooltip: () => void;
  dismissOnboardingTooltip: () => void;
  setOffline: (offline: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      mode: 'novice',
      sidebarCollapsed: false,
      rightPanelCollapsed: false,
      rightPanelTab: 'properties',
      commandPaletteOpen: false,
      notificationPanelOpen: false,
      searchOverlayOpen: false,
      cookieConsentAccepted: null,
      onboardingTooltipStep: 0,
      isOffline: false,

      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((s) => ({ mode: s.mode === 'novice' ? 'expert' : 'novice' })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setRightPanelCollapsed: (collapsed) => set({ rightPanelCollapsed: collapsed }),
      setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
      setSearchOverlayOpen: (open) => set({ searchOverlayOpen: open }),
      acceptCookies: () => set({ cookieConsentAccepted: true }),
      customizeCookies: () => set({ cookieConsentAccepted: false }),
      advanceOnboardingTooltip: () =>
        set((s) => ({ onboardingTooltipStep: s.onboardingTooltipStep + 1 })),
      dismissOnboardingTooltip: () => set({ onboardingTooltipStep: -1 }),
      setOffline: (offline) => set({ isOffline: offline }),
    }),
    {
      name: 'creatiai-ui',
      partialize: (s) => ({
        mode: s.mode,
        sidebarCollapsed: s.sidebarCollapsed,
        cookieConsentAccepted: s.cookieConsentAccepted,
      }),
    }
  )
);
