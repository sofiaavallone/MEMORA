import type {
  Deck,
  LoginInput,
  RegisterInput,
  Stats,
  Streak,
  User,
} from '@/types/domain'
import { mockDecks, mockStats, mockStreak, mockUser } from './mockData'

export interface Api {
  login(input: LoginInput): Promise<User>
  register(input: RegisterInput): Promise<User>
  logout(): Promise<void>
  getDecks(): Promise<Deck[]>
  generateDeck(topic: string, qty: number): Promise<Deck>
  getStats(): Promise<Stats>
  getStreak(): Promise<Streak>
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

const COLORS: Deck['color'][] = ['purple', 'indigo', 'pink', 'cyan']

function createMockApi(): Api {
  let decks = [...mockDecks]

  return {
    async login(input) {
      await delay(800)
      if (!input.email.includes('@') || input.password.length < 6) {
        throw new Error('Credenciais inválidas.')
      }
      return { ...mockUser, email: input.email }
    },
    async register(input) {
      await delay(900)
      if (input.password.length < 6) {
        throw new Error('A senha deve ter ao menos 6 caracteres.')
      }
      return { ...mockUser, name: input.name, email: input.email }
    },
    async logout() {
      await delay(150)
    },
    async getDecks() {
      await delay(250)
      return decks
    },
    async generateDeck(topic, qty) {
      await delay(1200)
      const id = `d_${Math.random().toString(36).slice(2, 8)}`
      const newDeck: Deck = {
        id,
        title: topic,
        topic: topic,
        cardCount: qty,
        studiedCount: 0,
        accuracy: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updatedAt: new Date().toISOString(),
        cards: [],
      }
      decks = [newDeck, ...decks]
      return newDeck
    },
    async getStats() {
      await delay(200)
      return mockStats
    },
    async getStreak() {
      await delay(150)
      return mockStreak
    },
  }
}

export const api: Api = createMockApi()
