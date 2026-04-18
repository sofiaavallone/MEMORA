export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  createdAt: string
}

export interface Flashcard {
  id: string
  question: string
  answer: string
  mastered: boolean
  order: number
  nextReviewAt: string
  interval: number
  correctCount: number
}

export type DeckColor = 'purple' | 'indigo' | 'pink' | 'cyan'

export interface Deck {
  id: string
  title: string
  topic: string
  color: DeckColor
  sourceName: string | null
  cardCount: number
  studiedCount: number
  accuracy: number // 0..1
  createdAt: string
  updatedAt: string
  flashcards?: Flashcard[]
  totalDurationSec?: number
}

export interface StatsSparklinePoint {
  date: string
  value: number
}

export interface Stats {
  deckCount: number
  flashcardCount: number
  cardsStudied: number
  cardsCorrect: number
  accuracy: number
  totalDurationSec: number
  sparkline: StatsSparklinePoint[]
}

export interface StreakDay {
  date: string
  active: boolean
}

export interface Streak {
  current: number
  longest: number
  lastStudiedAt: string | null
  last7: StreakDay[]
  daysSinceLast: number | null
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

export interface AuthResponse {
  user: User
  token: string
}

export type FlashcardReviewResult = 'correct' | 'incorrect'

export interface StudySessionSummary {
  id: string
  deckId: string
  startedAt: string
  durationSec: number
  cardsStudied: number
  cardsCorrect: number
}

export interface ReviewFlashcardInput {
  result: FlashcardReviewResult
  durationSec?: number
}

export interface ReviewFlashcardResponse {
  flashcard: Flashcard
  session: StudySessionSummary
}

export interface AuthConfig {
  googleOAuth: boolean
  googleClientId: string | null
}

export interface GenerateDeckInput {
  topic: string
  quantity: number
  pdfUrl?: string
  sourceName?: string
}
