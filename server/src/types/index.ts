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

export type PromptConfig = Readonly<{
  topico: string;
  quantidade: number;
}>;

export type PdfSourceKind = "buffer" | "url" | "local-file";

export interface PdfLoadResult {
  blob: Blob;
  source: PdfSourceKind;
  sizeInBytes: number;
}
