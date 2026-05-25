import { create } from "zustand";
import {
  fetchDecks,
  fetchDeck,
  generateDeck,
  deleteDeck,
  type DeckAPI,
} from "../services/deckService";

interface DeckState {
  decks: DeckAPI[];
  currentDeck: DeckAPI | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;

  loadDecks: () => Promise<void>;
  loadDeck: (id: string) => Promise<void>;
  createDeck: (params: { topic: string; quantity: number; sourceName?: string }) => Promise<DeckAPI>;
  removeDeck: (id: string) => Promise<void>;
  clearCurrentDeck: () => void;
  clearError: () => void;
}

export const useDeckStore = create<DeckState>((set) => ({
  decks: [],
  currentDeck: null,
  isLoading: false,
  isGenerating: false,
  error: null,

  loadDecks: async () => {
    set({ isLoading: true, error: null });
    try {
      const decks = await fetchDecks();
      set({ decks, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  loadDeck: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const deck = await fetchDeck(id);
      set({ currentDeck: deck, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createDeck: async (params) => {
    set({ isGenerating: true, error: null });
    try {
      const deck = await generateDeck(params);
      set((state) => ({ decks: [deck, ...state.decks], isGenerating: false }));
      return deck;
    } catch (err) {
      set({ error: (err as Error).message, isGenerating: false });
      throw err;
    }
  },

  removeDeck: async (id) => {
    try {
      await deleteDeck(id);
      set((state) => ({
        decks: state.decks.filter((d) => d.id !== id),
        currentDeck: state.currentDeck?.id === id ? null : state.currentDeck,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  clearCurrentDeck: () => set({ currentDeck: null }),
  clearError: () => set({ error: null }),
}));
