import { useState, useEffect } from "react";
import { fetchDueFlashcards, type FlashcardAPI } from "../services/deckService";

export type DeckDue = {
  deckId: string;
  deckTitle: string;
  cards: FlashcardAPI[];
};

type UseDueCardsReturn = {
  // Total de cards pendentes (para o badge da sidebar)
  totalDue: number;
  // Cards agrupados por deck (para a página de revisão)
  byDeck: DeckDue[];
  loading: boolean;
  error: string | null;
  // Chama novamente a API (útil após concluir uma sessão)
  refresh: () => void;
};

export function useDueCards(): UseDueCardsReturn {
  const [byDeck, setByDeck] = useState<DeckDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("memora_token");
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchDueFlashcards()
      .then(({ flashcards }) => {
        // Agrupa os cards por deck
        const map = new Map<string, DeckDue>();

        for (const card of flashcards) {
          if (!card.deckId || !card.deckTitle) continue;

          if (!map.has(card.deckId)) {
            map.set(card.deckId, {
              deckId: card.deckId,
              deckTitle: card.deckTitle,
              cards: [],
            });
          }
          map.get(card.deckId)!.cards.push(card);
        }

        setByDeck(Array.from(map.values()));
      })
      .catch(() => setError("Não foi possível carregar os cards pendentes."))
      .finally(() => setLoading(false));
  }, [tick]);

  return {
    totalDue: byDeck.reduce((acc, d) => acc + d.cards.length, 0),
    byDeck,
    loading,
    error,
    refresh: () => setTick((t) => t + 1),
  };
}