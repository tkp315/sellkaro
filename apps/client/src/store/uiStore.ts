import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../lib/colors';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  message: string;
  type: ToastType;
}

interface UIState {
  isSidebarOpen: boolean;
  toast: Toast | null;
  themeMode: ThemeMode;
  toggleSidebar: () => void;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      toast: null,
      themeMode: 'light',
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      showToast: (message, type = 'info') => set({ toast: { message, type } }),
      hideToast: () => set({ toast: null }),
      toggleTheme: () =>
        set((s) => ({ themeMode: s.themeMode === 'light' ? 'dark' : 'light' })),
      setTheme: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'olx-ui',
      partialize: (state) => ({ themeMode: state.themeMode }),
    },
  ),
);
