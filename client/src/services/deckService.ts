const API_URL = "http://localhost:3001/api";

function getToken(): string | null {
  return localStorage.getItem("memora_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type FlashcardAPI = {
  id: string;
  question: string;
  answer: string;
  mastered: boolean;
  order: number;
  nextReviewAt: string;
  interval: number;
  correctCount: number;
  deckId?: string;
  deckTitle?: string;
};

export type DeckAPI = {
  id: string;
  title: string;
  topic: string;
  color: string;
  sourceName: string | null;
  cardCount: number;
  studiedCount: number;
  accuracy: number;
  createdAt: string;
  updatedAt: string;
  flashcards?: FlashcardAPI[];
};

export async function fetchDecks(): Promise<DeckAPI[]> {
  const res = await fetch(`${API_URL}/decks`, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Erro ao buscar decks.");
  }
  const data = await res.json();
  return data.decks as DeckAPI[];
}

export async function fetchDeck(id: string): Promise<DeckAPI> {
  const res = await fetch(`${API_URL}/decks/${id}`, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Deck não encontrado.");
  }
  const data = await res.json();
  return data.deck as DeckAPI;
}

export async function generateDeck(params: {
  topic: string;
  quantity: number;
  sourceName?: string;
}): Promise<DeckAPI> {
  const res = await fetch(`${API_URL}/decks/generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Erro ao gerar deck.");
  }
  const data = await res.json();
  return data.deck as DeckAPI;
}

export async function deleteDeck(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/decks/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao deletar deck.");
}

/**
 * Busca flashcards com revisão pendente (nextReviewAt <= agora).
 * Se deckId for informado, filtra apenas aquele deck.
 */
export async function fetchDueFlashcards(deckId?: string): Promise<{
  flashcards: FlashcardAPI[];
  count: number;
}> {
  const url = deckId
    ? `${API_URL}/flashcards/due?deckId=${deckId}`
    : `${API_URL}/flashcards/due`;

  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Erro ao buscar cards para revisão.");
  }
  return res.json();
}

export async function reviewFlashcard(
  flashcardId: string,
  result: "correct" | "incorrect",
  durationSec?: number
): Promise<void> {
  const res = await fetch(`${API_URL}/flashcards/${flashcardId}/review`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ result, durationSec }),
  });
  if (!res.ok) throw new Error("Erro ao registrar resposta.");
}