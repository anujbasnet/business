import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AppNotification } from '@/types';

export interface NotificationsState {
  notifications: AppNotification[];
  addNotification: (
    input: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> & Partial<Pick<AppNotification, 'timestamp' | 'isRead'>>
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (input) => {
        const id = Math.random().toString(36).slice(2);
        const timestamp = input.timestamp ?? new Date().toISOString();
        const isRead = input.isRead ?? false;
        const notification: AppNotification = {
          id,
          type: input.type,
          title: input.title,
          message: input.message,
          clientName: input.clientName,
          appointmentId: input.appointmentId,
          timestamp,
          isRead,
        };
        set((state) => ({ notifications: [notification, ...state.notifications] }));
        console.log('[Notifications] Added', notification);
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        }));
      },
      markAllAsRead: () => {
        set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, isRead: true })) }));
      },
      clearAll: () => set({ notifications: [] }),
      get unreadCount() {
        return get().notifications.filter((n) => !n.isRead).length;
      },
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);
