import { create } from 'zustand'
import { api } from '@/services/api'
import { getToken, HttpError, setToken } from '@/lib/httpClient'
import type { AuthConfig, LoginInput, RegisterInput, User } from '@/types/domain'

interface AuthState {
  user: User | null
  token: string | null
  config: AuthConfig | null
  loading: boolean
  booted: boolean
  error: string | null
  bootstrap(): Promise<void>
  loadConfig(): Promise<void>
  login(input: LoginInput): Promise<boolean>
  register(input: RegisterInput): Promise<boolean>
  loginWithGoogle(idToken: string): Promise<boolean>
  logout(): Promise<void>
  clearError(): void
}

function toMessage(e: unknown, fallback: string): string {
  if (e instanceof HttpError) return e.message || fallback
  if (e instanceof Error) return e.message || fallback
  return fallback
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: getToken(),
  config: null,
  loading: false,
  booted: false,
  error: null,

  async bootstrap() {
    const token = getToken()
    if (!token) {
      set({ booted: true, user: null, token: null })
      return
    }
    set({ loading: true })
    try {
      const user = await api.me()
      set({ user, token, loading: false, booted: true })
    } catch (e) {
      if (e instanceof HttpError && (e.status === 401 || e.status === 404)) {
        setToken(null)
        set({ user: null, token: null, loading: false, booted: true })
        return
      }
      set({ loading: false, booted: true, error: toMessage(e, 'Erro ao restaurar sessão.') })
    }
  },

  async loadConfig() {
    if (get().config) return
    try {
      const config = await api.getAuthConfig()
      set({ config })
    } catch {
      // feature detection — falha silenciosa
      set({ config: { googleOAuth: false, googleClientId: null } })
    }
  },

  async login(input) {
    set({ loading: true, error: null })
    try {
      const { user, token } = await api.login(input)
      setToken(token)
      set({ user, token, loading: false })
      return true
    } catch (e) {
      set({ loading: false, error: toMessage(e, 'Erro ao entrar.') })
      return false
    }
  },

  async register(input) {
    set({ loading: true, error: null })
    try {
      const { user, token } = await api.register(input)
      setToken(token)
      set({ user, token, loading: false })
      return true
    } catch (e) {
      set({ loading: false, error: toMessage(e, 'Erro ao registrar.') })
      return false
    }
  },

  async loginWithGoogle(idToken) {
    set({ loading: true, error: null })
    try {
      const { user, token } = await api.loginWithGoogle(idToken)
      setToken(token)
      set({ user, token, loading: false })
      return true
    } catch (e) {
      set({ loading: false, error: toMessage(e, 'Falha no login com Google.') })
      return false
    }
  },

  async logout() {
    try {
      await api.logout()
    } catch {
      // ignora — stateless
    }
    setToken(null)
    set({ user: null, token: null })
  },

  clearError() {
    set({ error: null })
  },
}))
