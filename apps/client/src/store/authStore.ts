import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthTokens } from '@/modules/shared/auth/types';

// Refresh token is stored in sessionStorage (cleared on tab/browser close) to limit
// XSS exposure. Access token remains in localStorage for UX (auto-login on page reload).
const RT_KEY = 'olx-rt';
function readRt() { try { return sessionStorage.getItem(RT_KEY); } catch { return null; } }
function writeRt(v: string | null) { try { v ? sessionStorage.setItem(RT_KEY, v) : sessionStorage.removeItem(RT_KEY); } catch {} }

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, tokens: AuthTokens) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setTokens: (tokens: AuthTokens) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: readRt(),
      isAuthenticated: false,

      login: (user, tokens) => {
        writeRt(tokens.refreshToken);
        set({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, isAuthenticated: true });
      },

      logout: () => {
        writeRt(null);
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),

      setTokens: (tokens) => {
        writeRt(tokens.refreshToken);
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      },
    }),
    {
      name: 'olx-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        // refreshToken is intentionally excluded — stored in sessionStorage instead
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
