import { create } from 'zustand';
import type { Notification } from '../types';
import api from '../lib/api';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (n: Notification) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/api/notifications');
      const notifications = data.data || data;
      set({
        notifications,
        unreadCount: notifications.filter((n: Notification) => !n.read).length,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (id) => {
    await api.patch(`/api/notifications/${id}/read`);
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await api.patch('/api/notifications/read-all');
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set((s) => {
      const notif = s.notifications.find((n) => n.id === id);
      return {
        notifications: s.notifications.filter((n) => n.id !== id),
        unreadCount: notif && !notif.read ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  addNotification: (n) => {
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount: s.unreadCount + (n.read ? 0 : 1),
    }));
  },

  toggleOpen: () => {
    const { isOpen } = get();
    if (!isOpen) get().fetchNotifications();
    set((s) => ({ isOpen: !s.isOpen }));
  },

  setOpen: (open) => {
    if (open) get().fetchNotifications();
    set({ isOpen: open });
  },
}));
