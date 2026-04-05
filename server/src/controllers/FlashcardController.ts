import type { Request, Response } from "express";

import { FlashcardService } from "../services/FlashcardService.js";
import type { GenerateRequest, GenerateResponse } from "../types/index.js";

const REQUIRED_FIELDS_ERROR = "Os campos pdfUrl, topic e quantity são obrigatórios.";
const INVALID_FIELDS_ERROR =
  "Os campos informados são inválidos. Envie uma URL válida em pdfUrl e um quantity inteiro positivo.";
const INTERNAL_SERVER_ERROR = "Erro ao gerar flashcards. Tente novamente mais tarde.";

type GenerateRequestBody = Partial<GenerateRequest> & Record<string, unknown>;

interface ValidationResult {
  data?: GenerateRequest;
  error?: string;
}

export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  generate = async (
    req: Request<Record<string, never>, GenerateResponse | { error: string }, GenerateRequestBody>,
    res: Response<GenerateResponse | { error: string }>
  ): Promise<Response<GenerateResponse | { error: string }>> => {
    const validation = this.validateRequestBody(req.body);

    if (!validation.data) {
      return res.status(400).json({ error: validation.error ?? REQUIRED_FIELDS_ERROR });
    }

    try {
      const { pdfUrl, topic, quantity } = validation.data;
      const flashcards = await this.flashcardService.generate(pdfUrl, topic, quantity);

      return res.status(200).json({ flashcards });
    } catch (error) {
      console.error("Erro no controller de flashcards:", error);
      return res.status(500).json({ error: INTERNAL_SERVER_ERROR });
    }
  };

  private validateRequestBody(body: GenerateRequestBody | undefined): ValidationResult {
    if (!body) {
      return { error: REQUIRED_FIELDS_ERROR };
    }

    const pdfUrl = this.normalizeString(body.pdfUrl);
    const topic = this.normalizeString(body.topic);
    const quantity = body.quantity;

    if (!pdfUrl || !topic || quantity === undefined || quantity === null) {
      return { error: REQUIRED_FIELDS_ERROR };
    }

    if (!this.isValidUrl(pdfUrl) || !this.isPositiveInteger(quantity)) {
      return { error: INVALID_FIELDS_ERROR };
    }

    return {
      data: {
        pdfUrl,
        topic,
        quantity
      }
    };
  }

  private normalizeString(value: unknown): string | null {
    if (typeof value !== "string") {
      return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  private isPositiveInteger(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
  }

  private isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }
}
