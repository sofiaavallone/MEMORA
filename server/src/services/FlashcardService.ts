import { GoogleGenAI, createPartFromUri, createUserContent } from "@google/genai";

import type { Flashcard } from "../types/index.js";

// Atenção! Utilize um modelo leve e otimizado para tarefas de compreensão de texto, como o "gemini-2.5-flash-lite", para garantir respostas rápidas e eficientes na geração dos flashcards. Evite modelos mais pesados que podem gerar fallbacks e aumentar o tempo de resposta sem melhorar significativamente a qualidade dos flashcards para este caso de uso específico.
const MODEL_NAME = "gemini-2.5-flash-lite";
const FILE_POLL_INTERVAL_MS = 5_000;
const FILE_POLL_MAX_ATTEMPTS = 24;
const JSON_RESPONSE_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      pergunta: { type: "string" },
      resposta: { type: "string" }
    },
    required: ["pergunta", "resposta"]
  }
} as const;

interface UploadedGeminiFile {
  name?: string | null;
  uri?: string | null;
  mimeType?: string | null;
  state?: unknown;
}

export class FlashcardService {
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor(apiKey = process.env.GEMINI_API_KEY) {
    if (!apiKey) {
      throw new Error("A variável de ambiente GEMINI_API_KEY não está configurada.");
    }

    this.ai = new GoogleGenAI({ apiKey });
    this.model = MODEL_NAME;
  }

  async generate(pdfUrl: string, topic: string, quantity: number): Promise<Flashcard[]> {
    let uploadedFile: UploadedGeminiFile | null = null;

    try {
      uploadedFile = await this.uploadPdf(pdfUrl, "Material de Estudo");

      const fileUri = this.readRequiredFileValue(uploadedFile.uri, "uri");
      const fileMimeType = this.readRequiredFileValue(uploadedFile.mimeType, "mimeType");

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [
          createUserContent([
            this.buildInstructionPrompt(topic, quantity),
            createPartFromUri(fileUri, fileMimeType)
          ])
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: JSON_RESPONSE_SCHEMA,
          temperature: 0.4
        }
      });

      if (!response.text) {
        throw new Error("A IA não retornou conteúdo para os flashcards.");
      }

      return this.parseFlashcards(response.text, quantity);
    } catch (error) {
      console.error("Erro no serviço de flashcards:", error);
      throw new Error("Não foi possível gerar os flashcards com a IA.");
    } finally {
      if (uploadedFile?.name) {
        await this.deleteUploadedFile(uploadedFile.name);
      }
    }
  }

  private async uploadPdf(pdfUrl: string, displayName: string): Promise<UploadedGeminiFile> {
    const pdfBlob = await this.downloadPdf(pdfUrl);

    const uploadedFile = await this.ai.files.upload({
      file: pdfBlob,
      config: {
        displayName,
        mimeType: "application/pdf"
      }
    });

    const fileName = this.readRequiredFileValue(uploadedFile.name, "name");
    return this.waitForFileActivation(fileName);
  }

  private async downloadPdf(pdfUrl: string): Promise<Blob> {
    const response = await fetch(pdfUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Não foi possível baixar o PDF informado. Status: ${response.status}.`);
    }

    const pdfBytes = await response.arrayBuffer();

    if (pdfBytes.byteLength === 0) {
      throw new Error("O PDF informado está vazio.");
    }

    return new Blob([pdfBytes], { type: "application/pdf" });
  }

  private async waitForFileActivation(fileName: string): Promise<UploadedGeminiFile> {
    let currentFile = await this.ai.files.get({ name: fileName });

    for (let attempt = 0; attempt < FILE_POLL_MAX_ATTEMPTS; attempt += 1) {
      const currentState = this.normalizeFileState(currentFile.state);

      if (currentState === "ACTIVE") {
        return currentFile;
      }

      if (currentState === "FAILED") {
        throw new Error("A IA falhou ao processar o PDF enviado.");
      }

      if (attempt === FILE_POLL_MAX_ATTEMPTS - 1) {
        break;
      }

      await this.sleep(FILE_POLL_INTERVAL_MS);
      currentFile = await this.ai.files.get({ name: fileName });
    }

    throw new Error("O PDF não ficou disponível para uso dentro do tempo esperado.");
  }

  private buildInstructionPrompt(topic: string, quantity: number): string {
    return [
      "Você é um professor especialista em Active Recall e elaboração de flashcards acadêmicos de alta qualidade.",
      "Analise exclusivamente o PDF anexado para criar material de estudo fiel ao documento.",
      `Gere exatamente ${quantity} flashcards focados no tópico "${topic}".`,
      "Regras obrigatórias:",
      `1. Retorne somente JSON válido no formato [{\"pergunta\":\"...\",\"resposta\":\"...\"}] com exatamente ${quantity} itens.`,
      "2. Escreva tudo em português do Brasil.",
      "3. Cada pergunta deve exigir compreensão, aplicação, comparação, relação causal ou explicação conceitual, evitando memorização mecânica.",
      "4. Cada resposta deve ser objetiva, mas suficientemente completa para revisão rápida.",
      "5. Não invente conteúdo que não esteja sustentado pelo PDF.",
      "6. Não inclua markdown, comentários, texto introdutório ou cercas de código."
    ].join("\n");
  }

  private parseFlashcards(rawResponse: string, expectedQuantity: number): Flashcard[] {
    const sanitizedResponse = this.extractJsonPayload(rawResponse);
    const parsedResponse = JSON.parse(sanitizedResponse) as unknown;

    if (!Array.isArray(parsedResponse)) {
      throw new Error("A resposta da IA não está no formato de lista esperado.");
    }

    const flashcards = parsedResponse.map((item, index) => this.validateFlashcard(item, index));

    if (flashcards.length !== expectedQuantity) {
      throw new Error(
        `A IA retornou ${flashcards.length} flashcards, mas eram esperados ${expectedQuantity}.`
      );
    }

    return flashcards;
  }

  private validateFlashcard(value: unknown, index: number): Flashcard {
    if (!this.isFlashcard(value)) {
      throw new Error(`O item ${index + 1} da resposta da IA não é um flashcard válido.`);
    }

    const pergunta = value.pergunta.trim();
    const resposta = value.resposta.trim();

    if (!pergunta || !resposta) {
      throw new Error(`O item ${index + 1} da resposta da IA possui campos vazios.`);
    }

    return { pergunta, resposta };
  }

  private isFlashcard(value: unknown): value is Flashcard {
    if (!value || typeof value !== "object") {
      return false;
    }

    const candidate = value as Record<string, unknown>;

    return typeof candidate.pergunta === "string" && typeof candidate.resposta === "string";
  }

  private extractJsonPayload(rawResponse: string): string {
    const trimmedResponse = rawResponse.trim();

    if (!trimmedResponse.startsWith("```")) {
      return trimmedResponse;
    }

    const fencedMatch = trimmedResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

    if (!fencedMatch?.[1]) {
      throw new Error("A resposta da IA não contém um JSON válido.");
    }

    return fencedMatch[1].trim();
  }

  private normalizeFileState(state: unknown): string {
    if (typeof state === "string") {
      return state.toUpperCase();
    }

    if (state && typeof state === "object" && "toString" in state) {
      return String(state).toUpperCase();
    }

    return "";
  }

  private readRequiredFileValue(value: string | null | undefined, fieldName: string): string {
    if (!value) {
      throw new Error(`O arquivo enviado não retornou o campo obrigatório "${fieldName}".`);
    }

    return value;
  }

  private async deleteUploadedFile(fileName: string): Promise<void> {
    try {
      await this.ai.files.delete({ name: fileName });
    } catch (error) {
      console.error(`Não foi possível remover o arquivo remoto ${fileName}:`, error);
    }
  }

  private async sleep(delayInMs: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, delayInMs));
  }
}
