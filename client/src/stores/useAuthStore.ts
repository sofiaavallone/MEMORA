import { create } from 'zustand'
import { api } from '@/services/api'
import type { LoginInput, RegisterInput, User } from '@/types/domain'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  login(input: LoginInput): Promise<boolean>
  register(input: RegisterInput): Promise<boolean>
  logout(): Promise<void>
  clearError(): void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  async login(input) {
    set({ loading: true, error: null })
    try {
      const user = await api.login(input)
      set({ user, loading: false })
      return true
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Erro ao entrar.',
      })
      return false
    }
  },
  async register(input) {
    set({ loading: true, error: null })
    try {
      const user = await api.register(input)
      set({ user, loading: false })
      return true
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Erro ao registrar.',
      })
      return false
    }
  },
  async logout() {
    await api.logout()
    set({ user: null })
  },
  clearError() {
    set({ error: null })
  },
}))
