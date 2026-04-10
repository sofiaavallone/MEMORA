/** Erro base para falhas relacionadas ao serviço do Gemini */
export class GeminiServiceError extends Error {
  override readonly name!: string;

  constructor(message: string, public override readonly cause?: unknown) {
    super(message, { cause });
    Object.defineProperty(this, "name", {
      value: new.target.name,
      configurable: true,
      writable: false,
    });
  }
}

/** Erro lançado quando o parsing da resposta JSON da IA falha */
export class JsonParsingError extends GeminiServiceError {}

/** Erro lançado quando o processamento do arquivo excede o tempo limite */
export class FileProcessingTimeoutError extends GeminiServiceError {}

/** Erro lançado quando a configuração do prompt é inválida */
export class PromptValidationError extends Error {
  override readonly name = "PromptValidationError" as const;

  constructor(message: string) {
    super(message);
  }
}
