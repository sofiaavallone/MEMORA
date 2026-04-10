import { create } from 'zustand'
import { api } from '@/services/api'
import type { Deck, Stats, Streak } from '@/types/domain'

interface DeckState {
  decks: Deck[]
  stats: Stats | null
  streak: Streak | null
  loading: boolean
  generating: boolean
  hydrate(): Promise<void>
  generate(topic: string, qty: number): Promise<Deck>
}

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  stats: null,
  streak: null,
  loading: false,
  generating: false,
  async hydrate() {
    if (get().decks.length > 0) return
    set({ loading: true })
    const [decks, stats, streak] = await Promise.all([
      api.getDecks(),
      api.getStats(),
      api.getStreak(),
    ])
    set({ decks, stats, streak, loading: false })
  },
  async generate(topic, qty) {
    set({ generating: true })
    const deck = await api.generateDeck(topic, qty)
    set((s) => ({
      generating: false,
      decks: [deck, ...s.decks],
      stats: s.stats
        ? { ...s.stats, totalDecks: s.stats.totalDecks + 1 }
        : s.stats,
    }))
    return deck
  },
}))
