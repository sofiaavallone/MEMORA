import type { Deck, Stats, Streak, User } from '@/types/domain'

export const mockUser: User = {
  id: 'u_01',
  name: 'Leonardo',
  email: 'leo@memora.app',
}

export const mockDecks: Deck[] = [
  {
    id: 'd_01',
    title: 'Algoritmos & Estruturas de Dados',
    topic: 'Ciência da Computação',
    cardCount: 48,
    studiedCount: 32,
    accuracy: 0.82,
    color: 'purple',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    cards: [],
  },
  {
    id: 'd_02',
    title: 'Cálculo Diferencial',
    topic: 'Matemática',
    cardCount: 36,
    studiedCount: 14,
    accuracy: 0.71,
    color: 'indigo',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    cards: [],
  },
  {
    id: 'd_03',
    title: 'História Contemporânea',
    topic: 'História',
    cardCount: 60,
    studiedCount: 60,
    accuracy: 0.94,
    color: 'pink',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    cards: [],
  },
  {
    id: 'd_04',
    title: 'Fisiologia Cardiovascular',
    topic: 'Medicina',
    cardCount: 42,
    studiedCount: 8,
    accuracy: 0.65,
    color: 'cyan',
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    cards: [],
  },
  {
    id: 'd_05',
    title: 'Inglês — Phrasal Verbs',
    topic: 'Idiomas',
    cardCount: 80,
    studiedCount: 52,
    accuracy: 0.88,
    color: 'purple',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    cards: [],
  },
  {
    id: 'd_06',
    title: 'Direito Constitucional',
    topic: 'Direito',
    cardCount: 120,
    studiedCount: 44,
    accuracy: 0.76,
    color: 'indigo',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    cards: [],
  },
]

export const mockStats: Stats = {
  totalDecks: mockDecks.length,
  studiedToday: 47,
  accuracy: 0.83,
  minutesToday: 52,
  sparkline: {
    decks: [2, 3, 3, 4, 5, 5, 6],
    studied: [12, 28, 19, 34, 22, 41, 47],
    accuracy: [0.62, 0.68, 0.74, 0.71, 0.79, 0.81, 0.83],
    minutes: [18, 24, 30, 22, 38, 44, 52],
  },
}

export const mockStreak: Streak = {
  currentDays: 7,
  bestDays: 23,
  last7: [true, true, true, true, true, true, true],
}
