import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser, registerUser, type AuthUser } from "../services/authService";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await loginUser({ email, password });
          localStorage.setItem("memora_token", token);
          set({ user, token, isLoading: false });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await registerUser({ name, email, password });
          localStorage.setItem("memora_token", token);
          set({ user, token, isLoading: false });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem("memora_token");
        set({ user: null, token: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "memora_auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
