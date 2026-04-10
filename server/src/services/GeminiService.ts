import { GoogleGenAI, createPartFromUri, createUserContent } from "@google/genai";

import {
  GeminiServiceError,
  FileProcessingTimeoutError,
  JsonParsingError,
} from "../errors/index.js";
import type { Flashcard } from "../types/index.js";

const GEMINI_CONFIG = {
  model: "gemini-2.5-flash",
  pollingIntervalMs: 3_000,
  maxPollingAttempts: 20,
  uploadDisplayName: "Material_Flashcards.pdf",
} as const;

const JSON_RESPONSE_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      pergunta: { type: "string" },
      resposta: { type: "string" },
    },
    required: ["pergunta", "resposta"],
  },
} as const;

interface UploadedFile {
  readonly name: string;
  readonly uri: string;
  readonly mimeType: string;
}

export class GeminiService {
  private readonly ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      throw new GeminiServiceError(
        "[GeminiService] Variável de ambiente GEMINI_API_KEY não encontrada ou vazia."
      );
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  public async generateFlashcards(pdfBlob: Blob, prompt: string): Promise<Flashcard[]> {
    let uploadedFile: UploadedFile | undefined;

    try {
      uploadedFile = await this.uploadFile(pdfBlob);
      await this.waitForProcessing(uploadedFile.name);
      const responseText = await this.callModel(uploadedFile, prompt);
      return this.parseJsonResponse(responseText);
    } catch (error) {
      if (error instanceof GeminiServiceError) throw error;
      throw new GeminiServiceError(
        "[GeminiService] Erro inesperado durante a geração de flashcards.",
        error
      );
    } finally {
      if (uploadedFile) {
        await this.cleanupRemoteFile(uploadedFile.name);
      }
    }
  }

  private async uploadFile(pdfBlob: Blob): Promise<UploadedFile> {
    console.log("[GeminiService] Fazendo upload do arquivo...");

    const result = await this.ai.files.upload({
      file: pdfBlob,
      config: { displayName: GEMINI_CONFIG.uploadDisplayName },
    });

    const name = this.readRequiredFileValue(result.name, "name");
    const uri = this.readRequiredFileValue(result.uri, "uri");

    return { name, uri, mimeType: pdfBlob.type };
  }

  private async callModel(file: UploadedFile, prompt: string): Promise<string> {
    console.log("[GeminiService] Arquivo pronto. Gerando flashcards...");

    const filePart = createPartFromUri(file.uri, file.mimeType);

    const response = await this.ai.models.generateContent({
      model: GEMINI_CONFIG.model,
      contents: [
        createUserContent([prompt, filePart]),
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: JSON_RESPONSE_SCHEMA,
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) {
      throw new GeminiServiceError("[GeminiService] A IA retornou uma resposta vazia.");
    }

    return text;
  }

  private async waitForProcessing(fileName: string): Promise<void> {
    for (let attempt = 1; attempt <= GEMINI_CONFIG.maxPollingAttempts; attempt++) {
      const fileInfo = await this.ai.files.get({ name: fileName });
      const state = this.normalizeFileState(fileInfo.state);

      if (state === "ACTIVE") {
        console.log("[GeminiService] Arquivo pronto para uso.");
        return;
      }

      if (state === "FAILED") {
        throw new GeminiServiceError(
          `[GeminiService] O Google falhou ao processar o arquivo: ${fileName}`
        );
      }

      console.log(
        `[GeminiService] Aguardando processamento... ` +
        `(tentativa ${attempt}/${GEMINI_CONFIG.maxPollingAttempts}, estado: ${state})`
      );

      await this.sleep(GEMINI_CONFIG.pollingIntervalMs);
    }

    throw new FileProcessingTimeoutError(
      `[GeminiService] Timeout: arquivo "${fileName}" não ficou pronto após ` +
      `${GEMINI_CONFIG.maxPollingAttempts} tentativas.`
    );
  }

  private parseJsonResponse(rawResponse: string): Flashcard[] {
    console.log("[GeminiService] Fazendo parse da resposta JSON...");

    const sanitized = this.extractJsonPayload(rawResponse);

    try {
      const parsed: unknown = JSON.parse(sanitized);

      if (!Array.isArray(parsed)) {
        throw new JsonParsingError(
          `[GeminiService] A IA não retornou um Array JSON. Recebido: ${typeof parsed}`
        );
      }

      return parsed.map((item, index) => this.validateFlashcard(item, index));
    } catch (error) {
      if (error instanceof GeminiServiceError) throw error;
      throw new JsonParsingError(
        "[GeminiService] Falha ao decodificar o JSON da resposta.",
        error
      );
    }
  }

  private validateFlashcard(value: unknown, index: number): Flashcard {
    if (!this.isFlashcard(value)) {
      throw new JsonParsingError(
        `[GeminiService] O item ${index + 1} da resposta da IA não é um flashcard válido.`
      );
    }

    const pergunta = value.pergunta.trim();
    const resposta = value.resposta.trim();

    if (!pergunta || !resposta) {
      throw new JsonParsingError(
        `[GeminiService] O item ${index + 1} da resposta da IA possui campos vazios.`
      );
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
    const trimmed = rawResponse.trim();

    if (!trimmed.startsWith("```")) {
      return trimmed;
    }

    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

    if (!fencedMatch?.[1]) {
      throw new JsonParsingError(
        "[GeminiService] A resposta da IA não contém um JSON válido."
      );
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
      throw new GeminiServiceError(
        `[GeminiService] Upload concluído, mas o servidor não retornou o campo "${fieldName}".`
      );
    }

    return value;
  }

  private async cleanupRemoteFile(fileName: string): Promise<void> {
    try {
      console.log(`[GeminiService] Deletando arquivo temporário: ${fileName}...`);
      await this.ai.files.delete({ name: fileName });
      console.log("[GeminiService] Arquivo deletado com sucesso.");
    } catch (error) {
      console.warn(
        `[GeminiService] Não foi possível deletar "${fileName}" da nuvem. ` +
        `Pode consumir cota de armazenamento.`,
        error
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
