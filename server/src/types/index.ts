export interface Flashcard {
  pergunta: string;
  resposta: string;
}

export interface GenerateRequest {
  pdfUrl: string;
  topic: string;
  quantity: number;
}

export interface GenerateResponse {
  flashcards: Flashcard[];
}
