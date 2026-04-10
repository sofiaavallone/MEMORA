import { http } from '@/lib/httpClient'
import type {
  AuthConfig,
  AuthResponse,
  Deck,
  GenerateDeckInput,
  LoginInput,
  RegisterInput,
  Stats,
  Streak,
  User,
} from '@/types/domain'

export interface Api {
  getAuthConfig(): Promise<AuthConfig>
  login(input: LoginInput): Promise<AuthResponse>
  register(input: RegisterInput): Promise<AuthResponse>
  loginWithGoogle(idToken: string): Promise<AuthResponse>
  me(): Promise<User>
  logout(): Promise<void>
  getDecks(): Promise<Deck[]>
  getDeck(id: string): Promise<Deck>
  deleteDeck(id: string): Promise<void>
  generateDeck(input: GenerateDeckInput): Promise<Deck>
  getStats(): Promise<Stats>
  getStreak(): Promise<Streak>
  createSession(input: {
    deckId: string
    durationSec: number
    cardsStudied: number
    cardsCorrect: number
    masteredIds?: string[]
  }): Promise<void>
}

export const api: Api = {
  getAuthConfig: () => http.get<AuthConfig>('/auth/config', { auth: false }),

  login: (input) => http.post<AuthResponse>('/auth/login', input, { auth: false }),

  register: (input) => http.post<AuthResponse>('/auth/register', input, { auth: false }),

  loginWithGoogle: (idToken) =>
    http.post<AuthResponse>('/auth/google', { idToken }, { auth: false }),

  me: async () => {
    const res = await http.get<{ user: User }>('/auth/me')
    return res.user
  },

  logout: () => http.post<void>('/auth/logout'),

  getDecks: async () => {
    const res = await http.get<{ decks: Deck[] }>('/decks')
    return res.decks
  },

  getDeck: async (id) => {
    const res = await http.get<{ deck: Deck }>(`/decks/${id}`)
    return res.deck
  },

  deleteDeck: (id) => http.delete<void>(`/decks/${id}`),

  generateDeck: async (input) => {
    const res = await http.post<{ deck: Deck }>('/decks/generate', input)
    return res.deck
  },

  getStats: async () => {
    const res = await http.get<{ stats: Stats }>('/stats/overview')
    return res.stats
  },

  getStreak: async () => {
    const res = await http.get<{ streak: Streak }>('/stats/streak')
    return res.streak
  },

  createSession: (input) => http.post<void>('/sessions', input),
}
