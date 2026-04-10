import { create } from 'zustand'
import { api } from '@/services/api'
import { HttpError } from '@/lib/httpClient'
import type { Deck, GenerateDeckInput, Stats, Streak } from '@/types/domain'

interface DeckState {
  decks: Deck[]
  stats: Stats | null
  streak: Streak | null
  loading: boolean
  generating: boolean
  loaded: boolean
  error: string | null
  hydrate(force?: boolean): Promise<void>
  refreshDecks(): Promise<void>
  refreshStats(): Promise<void>
  generate(input: GenerateDeckInput): Promise<Deck>
  remove(id: string): Promise<void>
  reset(): void
}

function toMessage(e: unknown, fallback: string): string {
  if (e instanceof HttpError) return e.message || fallback
  if (e instanceof Error) return e.message || fallback
  return fallback
}

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  stats: null,
  streak: null,
  loading: false,
  generating: false,
  loaded: false,
  error: null,

  async hydrate(force = false) {
    if (get().loaded && !force) return
    set({ loading: true, error: null })
    try {
      const [decks, stats, streak] = await Promise.all([
        api.getDecks(),
        api.getStats(),
        api.getStreak(),
      ])
      set({ decks, stats, streak, loading: false, loaded: true })
    } catch (e) {
      set({ loading: false, error: toMessage(e, 'Erro ao carregar dados.') })
    }
  },

  async refreshDecks() {
    try {
      const decks = await api.getDecks()
      set({ decks })
    } catch (e) {
      set({ error: toMessage(e, 'Erro ao atualizar decks.') })
    }
  },

  async refreshStats() {
    try {
      const [stats, streak] = await Promise.all([api.getStats(), api.getStreak()])
      set({ stats, streak })
    } catch (e) {
      set({ error: toMessage(e, 'Erro ao atualizar estatísticas.') })
    }
  },

  async generate(input) {
    set({ generating: true, error: null })
    try {
      const deck = await api.generateDeck(input)
      set((s) => ({ generating: false, decks: [deck, ...s.decks] }))
      // Atualiza estatísticas em background
      void get().refreshStats()
      return deck
    } catch (e) {
      set({ generating: false, error: toMessage(e, 'Erro ao gerar deck.') })
      throw e
    }
  },

  async remove(id) {
    try {
      await api.deleteDeck(id)
      set((s) => ({ decks: s.decks.filter((d) => d.id !== id) }))
      void get().refreshStats()
    } catch (e) {
      set({ error: toMessage(e, 'Erro ao excluir deck.') })
    }
  },

  reset() {
    set({ decks: [], stats: null, streak: null, loaded: false, error: null })
  },
}))
