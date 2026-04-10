import { FlashcardPromptBuilder } from "../prompts/FlashcardPromptBuilder.js";
import { PdfManager } from "../utils/PdfManager.js";
import { GeminiService } from "./GeminiService.js";
import type { Flashcard } from "../types/index.js";

/** Serviço orquestrador para geração de flashcards a partir de PDFs via IA. */
export class FlashcardService {
  private readonly pdfManager: PdfManager;
  private readonly promptBuilder: FlashcardPromptBuilder;
  private readonly geminiService: GeminiService;

  constructor() {
    this.pdfManager = new PdfManager();
    this.promptBuilder = new FlashcardPromptBuilder();
    this.geminiService = new GeminiService();
  }

  async generate(pdfUrl: string, topic: string, quantity: number): Promise<Flashcard[]> {
    // 1. Construir o prompt (fail-fast — valida antes de qualquer I/O)
    const prompt = this.promptBuilder.build({ topico: topic, quantidade: quantity });

    // 2. Adquirir o PDF via PdfManager
    const { blob } = await this.pdfManager.loadPdf(pdfUrl);

    // 3. Gerar flashcards via GeminiService
    return this.geminiService.generateFlashcards(blob, prompt);
  }
}
