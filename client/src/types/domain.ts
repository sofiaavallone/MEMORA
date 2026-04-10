export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface Flashcard {
  id: string
  front: string
  back: string
  mastered: boolean
}

export interface Deck {
  id: string
  title: string
  topic: string
  cardCount: number
  studiedCount: number
  accuracy: number // 0..1
  color: 'purple' | 'indigo' | 'pink' | 'cyan'
  updatedAt: string // ISO
  cards: Flashcard[]
}

export interface Stats {
  totalDecks: number
  studiedToday: number
  accuracy: number // 0..1
  minutesToday: number
  sparkline: {
    decks: number[]
    studied: number[]
    accuracy: number[]
    minutes: number[]
  }
}

export interface Streak {
  currentDays: number
  bestDays: number
  last7: boolean[] // true = studied that day
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}
