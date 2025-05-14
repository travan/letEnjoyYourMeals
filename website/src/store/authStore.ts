import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  login,
  getCurrentSession,
  logout,
  getCaptcha,
} from "../services/authService";

interface AuthState {
  session: unknown;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  authenticate: (location: { lat: number; lng: number }) => Promise<void>;
  loadSession: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  immer((set) => ({
    session: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    authenticate: async (location) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const { captchaId, question } = await getCaptcha();
        const captchaToken = question.split(": ")[1];
        await login(captchaId, captchaToken, location);
        const session = await getCurrentSession();
        set((state) => {
          state.session = session;
          state.isAuthenticated = true;
        });
      } catch (err) {
        set((state) => {
          state.error = err instanceof Error ? err.message : "Unknown error";
        });
        throw new Error("error");
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    loadSession: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const session = await getCurrentSession();
        set((state) => {
          state.session = session;
          state.isAuthenticated = true;
        });
      } catch {
        set((state) => {
          state.session = null;
          state.isAuthenticated = false;
        });
        throw new Error("error");
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    logoutUser: async () => {
      await logout();
      set((state) => {
        state.session = null;
        state.isAuthenticated = false;
      });
    },
  }))
);
