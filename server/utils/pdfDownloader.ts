// Importações
import { promises as fs } from "fs";
import type { PathLike } from "fs";

// constantes
const PDF_MIME_TYPE = "application/pdf" as const;
const HTTP_HEADERS = {
    "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
} as const;

// Interfaces
export interface PdfLoadResult {
    blob: Blob;
    source: PdfSourceKind; // de onde veio
    sizeInBytes: number;   // tamanho já calculado para quem precisar
}

// Tipos
export type PdfSource = Buffer | string;
export type PdfSourceKind = "buffer" | "url" | "local-file";

// Classe principal
export class PdfManager {
    // overloads
    public async loadPdf(source: Buffer): Promise<PdfLoadResult>;
    public async loadPdf(source: string): Promise<PdfLoadResult>;
    public async loadPdf(source: string | Buffer): Promise<PdfLoadResult>;

    // implementação  
    public async loadPdf(source: PdfSource): Promise<PdfLoadResult> {
        // o TypeScript entende que dentro de cada if o tipo é mais
        // específico. Após o if (Buffer.isBuffer), source só pode ser Buffer.
        if (Buffer.isBuffer(source)) {
            return this.fromBuffer(source);
        }

        if (typeof source === "string") {
            return this.isUrl(source)
                ?this.fromUrl(source)
                :this.fromLocalFile(source);
        }

        //Erro
        const _exhaustive: never = source;
        throw new Error(
        `[PdfManager] Tipo de entrada inesperado: ${typeof _exhaustive}`
        );
    }

    // Métodos privados

    // Verifica se a string é uma URL HTTP/HTTPS válida
    private isUrl(source: string): boolean {
        try {
            const { protocol } = new URL(source);
            return protocol === "http:" || protocol === "https:";
        } catch {
            return false;
        }
    }

    /**
    * Baixa um PDF de uma URL remota.
    * "private async" → só acessível dentro da classe, retorna uma Promise.
    */
    private async fromUrl(url: string): Promise<PdfLoadResult> {
        console.log(`[PdfManager] Baixando de URL: ${url}`);

        // AbortController permite cancelar o fetch após um timeout.
        // Sem isso, um servidor lento pode travar a operação indefinidamente.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30_000); //30s

        try {
            const response = await fetch(url, {
                headers: HTTP_HEADERS,
                signal: controller.signal, // conecta o cancelador ao fetch
            });

            // Verificação explícita do status HTTP antes de tentar ler o body.
            if (!response.ok) {
                throw new Error(
                `[PdfManager] Falha no download. Status: ${response.status} ${response.statusText}`
                );
            }

            // Verificamos o Content-Type para garantir que recebemos um PDF de verdade
            // e não uma página de erro HTML disfarçada de sucesso.
            const contentType = response.headers.get("content-type") ?? "";
            if (!contentType.includes("pdf") && !contentType.includes("octet-stream")) {
                console.warn(
                `[PdfManager] Content-Type inesperado: "${contentType}". Continuando mesmo assim.`
                );
            }

            const arrayBuffer = await response.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: PDF_MIME_TYPE });

            // Retornamos o resultado enriquecido em vez de só o Blob.
            return { blob, source: "url", sizeInBytes: blob.size };
        } finally {
            // "finally" executa SEMPRE — sucesso ou erro.
            // Essencial para não vazar o timer mesmo se o fetch lançar exceção.
            clearTimeout(timeoutId);
        }
    }

    /**
     * Lê um PDF do sistema de arquivos local.
     * PathLike aceita string, Buffer ou URL — mais flexível que só string.
     */
    private async fromLocalFile(filePath: PathLike): Promise<PdfLoadResult> {
        console.log(`[PdfManager] Lendo arquivo local: ${filePath}`);

        try {
        const fileBuffer = await fs.readFile(filePath);
        const blob = new Blob([fileBuffer], { type: PDF_MIME_TYPE });
        return { blob, source: "local-file", sizeInBytes: blob.size };
        } catch (error) {
        // Enriquecemos o erro com contexto antes de re-lançar.
        // Quem chamou sabe o que estava tentando; nós adicionamos o "onde falhou".
        throw new Error(
            `[PdfManager] Falha ao ler "${filePath}": ${(error as Error).message}`
        );
        }
    }

    /**
     * Converte um Buffer de memória em Blob.
     * Síncrono: não há I/O, não precisa ser async.
     */
    private fromBuffer(buffer: Buffer): PdfLoadResult {
    const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;

    const blob = new Blob([arrayBuffer], { type: PDF_MIME_TYPE });
    return { blob, source: "buffer", sizeInBytes: blob.size };
    }
}