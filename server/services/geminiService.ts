import { GoogleGenAI } from "@google/genai";
import type { Part } from "@google/genai";   // tipo do SDK para "partes" do conteúdo
import type { Flashcard } from "../prompts/flashcardsPrompt.js";

// Constantes
const GEMINI_CONFIG = {
    model: "gemini-2.5-flash",
    pollingIntervalMs: 3_000,   
    maxPollingAttempts: 20, // teto de tentativas — sem isso, um arquivo travado 
                            // em "PROCESSING" faz o while rodar para sempre (loop infinito)
    uploadDisplayName: "Material_Flashcards.pdf",
} as const;

// Tipos auxiliares
type FileProcessingState = "ACTIVE" | "PROCESSING" | "FAILED";

// Classe de erro
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

export class JsonParsingError extends GeminiServiceError {}
export class FileProcessingTimeoutError extends GeminiServiceError {} 

// Inteface de resultado medio
interface UploadedFile {
    readonly name: string;
    readonly uri: string;
    readonly mimeType: string;
}

// Classe principal
/**
 * Orquestra a comunicação com a API do Google Gemini:
 * upload → polling → geração → parse → cleanup.
 *
 * @example
 * const service = new GeminiService();
 * const cards = await service.generateFlashcards(pdfBlob, promptString);
 */
export class GeminiService {
  // "readonly" impede que this.ai seja reatribuído após o construtor.
  // Não é imutabilidade profunda — o objeto em si pode mudar — mas sinaliza
  // intenção: essa dependência é injetada uma vez e não troca.
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

    /**
   * Fluxo completo: upload → polling → geração → parse → cleanup.
   * O cleanup ocorre em "finally" — garante execução mesmo com erro.
   */
    public async generateFlashcards(
        pdfBlob: Blob,
        prompt: string
        ): Promise<Flashcard[]> {
        // "uploadedFile" começa undefined. Se o upload falhar antes de retornar
        // o nome, o finally não tenta deletar um arquivo que não existe.
        let uploadedFile: UploadedFile | undefined;

        try {
        // Passo 1: upload — agora em método próprio que já valida o retorno
            uploadedFile = await this.uploadFile(pdfBlob);

        // Passo 2: polling — aguarda o Google processar o PDF
            await this.waitForProcessing(uploadedFile.name);

        // Passo 3: geração — monta o payload e chama a IA
            const responseText = await this.callModel(uploadedFile, prompt);

        // Passo 4: parse — converte a string JSON em Array<Flashcard> validado
            return this.parseJsonResponse(responseText);
        } catch (error) {
        // Re-lançamos erros conhecidos sem modificar.
        // Erros desconhecidos são envelopados para manter a hierarquia.
            if (error instanceof GeminiServiceError) throw error;
            throw new GeminiServiceError(
                `[GeminiService] Erro inesperado durante a geração de flashcards.`,
                error  // preservado em "cause" para o stack trace completo
            );
        } finally {
        // Passo 5: cleanup — executa SEMPRE, com ou sem erro nos passos anteriores.
        // O operador "?." evita chamar cleanup se o upload nem começou.
            if (uploadedFile) {
                await this.cleanupRemoteFile(uploadedFile.name);
            }
            }
    }

  // upload
    private async uploadFile(pdfBlob: Blob): Promise<UploadedFile> {
        console.log("[GeminiService] Fazendo upload do arquivo...");

        const result = await this.ai.files.upload({
        file: pdfBlob,
        config: { displayName: GEMINI_CONFIG.uploadDisplayName },
        });

        if (!result.name || !result.uri) {
        throw new GeminiServiceError(
            "[GeminiService] Upload concluído, mas o servidor não retornou name/uri do arquivo."
        );
        }

        return {
        name: result.name,
        uri: result.uri,
        mimeType: pdfBlob.type,
        };
    }

    // Chamando o modelo
    private async callModel(
        file: UploadedFile,
        prompt: string
    ): Promise<string> {
        console.log("[GeminiService] Arquivo pronto. Gerando flashcards...");

        // "Part" é o tipo do SDK que descreve cada "parte" do conteúdo enviado.
        // Tipando explicitamente evitamos enviar campos errados silenciosamente.
        const filePart: Part = {
        fileData: {
            fileUri: file.uri,
            mimeType: file.mimeType,
        },
        };

        const response = await this.ai.models.generateContent({
        model: GEMINI_CONFIG.model,
        contents: [prompt, filePart],
        config: { responseMimeType: "application/json" },
        });

        const text = response.text;

        if (!text) {
        throw new GeminiServiceError("[GeminiService] A IA retornou uma resposta vazia.");
        }

        return text;
    }

    // Polling
    private async waitForProcessing(fileName: string): Promise<void> {
        for (let attempt = 1; attempt <= GEMINI_CONFIG.maxPollingAttempts; attempt++) {
        const fileInfo = await this.ai.files.get({ name: fileName });

        // Assertion de tipo: garantimos que "state" só pode ser um dos valores
        // conhecidos. Se o SDK retornar algo novo, o TypeScript avisa.
        const state = fileInfo.state as FileProcessingState;

        if (state === "ACTIVE") {
            console.log("[GeminiService] Arquivo pronto para uso.");
            return; // saída feliz
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

        // Se chegou aqui, esgotamos as tentativas sem "ACTIVE" ou "FAILED"
        throw new FileProcessingTimeoutError(
        `[GeminiService] Timeout: arquivo "${fileName}" não ficou pronto após ` +
            `${GEMINI_CONFIG.maxPollingAttempts} tentativas.`
        );
    }

    // Parse
    private parseJsonResponse(jsonString: string): Flashcard[] {
        console.log("[GeminiService] Fazendo parse da resposta JSON...");

        try {
            const parsed: unknown = JSON.parse(jsonString);

            // "unknown" força a verificação antes de usar o valor.
            // Sem isso, "parsed as Flashcard[]" seria um cast cego — o TypeScript
            // aceitaria, mas em runtime poderia ser qualquer coisa.
            if (!Array.isArray(parsed)) {
                throw new JsonParsingError(
                "[GeminiService] A IA não retornou um Array JSON. " +
                    `Recebido: ${typeof parsed}`
                );
            }

            return parsed as Flashcard[];
        } catch (error) {
            if (error instanceof JsonParsingError) throw error;
            throw new JsonParsingError(
                "[GeminiService] Falha ao decodificar o JSON da resposta.",
                error
            );
        }
    }

    // limpeza
    private async cleanupRemoteFile(fileName: string): Promise<void> {
        try {
            console.log(`[GeminiService] Deletando arquivo temporário: ${fileName}...`);
            await this.ai.files.delete({ name: fileName });
            console.log("[GeminiService] Arquivo deletado com sucesso.");
        } catch (error) {
        // Silenciamos erros de cleanup intencionalmente:
        // a operação principal já terminou (com sucesso ou erro).
        // Falhar no cleanup não deve mascarar o resultado real para o chamador.
            console.warn(
                `[GeminiService] Não foi possível deletar "${fileName}" da nuvem. ` +
                `Pode consumir cota de armazenamento.`,
                error
            );
        }
    }

    // utilitidade - sleep
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}