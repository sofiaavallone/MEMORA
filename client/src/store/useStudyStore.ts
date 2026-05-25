import { create } from "zustand";
import {
  fetchDueFlashcards,
  reviewFlashcard,
  type FlashcardAPI,
} from "../services/deckService";

interface StudyState {
  queue: FlashcardAPI[];
  currentIndex: number;
  isLoading: boolean;
  isReviewing: boolean;
  error: string | null;

  // Estatísticas da sessão
  sessionCorrect: number;
  sessionIncorrect: number;

  loadDueCards: (deckId?: string) => Promise<void>;
  answerCard: (result: "correct" | "incorrect", durationSec?: number) => Promise<void>;
  resetSession: () => void;
  clearError: () => void;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isLoading: false,
  isReviewing: false,
  error: null,
  sessionCorrect: 0,
  sessionIncorrect: 0,

  loadDueCards: async (deckId) => {
    set({ isLoading: true, error: null });
    try {
      const { flashcards } = await fetchDueFlashcards(deckId);
      set({ queue: flashcards, currentIndex: 0, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  answerCard: async (result, durationSec) => {
    const { queue, currentIndex } = get();
    const card = queue[currentIndex];
    if (!card) return;

    set({ isReviewing: true });
    try {
      await reviewFlashcard(card.id, result, durationSec);
      set((state) => ({
        currentIndex: state.currentIndex + 1,
        sessionCorrect: result === "correct" ? state.sessionCorrect + 1 : state.sessionCorrect,
        sessionIncorrect: result === "incorrect" ? state.sessionIncorrect + 1 : state.sessionIncorrect,
        isReviewing: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isReviewing: false });
    }
  },

  resetSession: () =>
    set({
      queue: [],
      currentIndex: 0,
      sessionCorrect: 0,
      sessionIncorrect: 0,
      error: null,
    }),

  clearError: () => set({ error: null }),
}));
