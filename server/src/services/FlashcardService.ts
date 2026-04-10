import { FlashcardPromptBuilder } from "../prompts/FlashcardPromptBuilder.js";
import { PdfManager } from "../utils/PdfManager.js";
import { GeminiService } from "./GeminiService.js";
import type { Flashcard } from "../types/index.js";

export interface GenerateFlashcardsInput {
  topic: string;
  quantity: number;
  pdfUrl?: string;
}

/** Serviço orquestrador para geração de flashcards via IA. */
export class FlashcardService {
  private readonly pdfManager: PdfManager;
  private readonly promptBuilder: FlashcardPromptBuilder;
  private readonly geminiService: GeminiService;

  constructor() {
    this.pdfManager = new PdfManager();
    this.promptBuilder = new FlashcardPromptBuilder();
    this.geminiService = new GeminiService();
  }

  async generate({ topic, quantity, pdfUrl }: GenerateFlashcardsInput): Promise<Flashcard[]> {
    // 1. Construir o prompt (fail-fast — valida antes de qualquer I/O)
    const prompt = this.promptBuilder.build({ topico: topic, quantidade: quantity });

    // 2. Se houver PDF, anexa-o ao Gemini; caso contrário, gera somente a partir do tópico
    if (pdfUrl) {
      const { blob } = await this.pdfManager.loadPdf(pdfUrl);
      return this.geminiService.generateFlashcards(blob, prompt);
    }

    return this.geminiService.generateFlashcardsFromPrompt(prompt);
  }
}
