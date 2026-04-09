import { promises as fs } from "fs";
import type { PathLike } from "fs";

import type { PdfLoadResult, PdfSourceKind } from "../types/index.js";

const PDF_MIME_TYPE = "application/pdf" as const;
const DOWNLOAD_TIMEOUT_MS = 30_000;
const HTTP_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
} as const;

export type PdfSource = Buffer | string;

export class PdfManager {
  public async loadPdf(source: Buffer): Promise<PdfLoadResult>;
  public async loadPdf(source: string): Promise<PdfLoadResult>;
  public async loadPdf(source: string | Buffer): Promise<PdfLoadResult>;
  public async loadPdf(source: PdfSource): Promise<PdfLoadResult> {
    if (Buffer.isBuffer(source)) {
      return this.fromBuffer(source);
    }

    if (typeof source === "string") {
      return this.isUrl(source)
        ? this.fromUrl(source)
        : this.fromLocalFile(source);
    }

    const _exhaustive: never = source;
    throw new Error(`[PdfManager] Tipo de entrada inesperado: ${typeof _exhaustive}`);
  }

  private isUrl(source: string): boolean {
    try {
      const { protocol } = new URL(source);
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  }

  private async fromUrl(url: string): Promise<PdfLoadResult> {
    console.log(`[PdfManager] Baixando de URL: ${url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => { controller.abort(); }, DOWNLOAD_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: HTTP_HEADERS,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `[PdfManager] Falha no download. Status: ${response.status} ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("pdf") && !contentType.includes("octet-stream")) {
        console.warn(
          `[PdfManager] Content-Type inesperado: "${contentType}". Continuando mesmo assim.`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: PDF_MIME_TYPE });
      return { blob, source: "url", sizeInBytes: blob.size };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fromLocalFile(filePath: PathLike): Promise<PdfLoadResult> {
    console.log(`[PdfManager] Lendo arquivo local: ${String(filePath)}`);
    try {
      const fileBuffer = await fs.readFile(filePath);
      const blob = new Blob([fileBuffer], { type: PDF_MIME_TYPE });
      return { blob, source: "local-file", sizeInBytes: blob.size };
    } catch (error) {
      throw new Error(
        `[PdfManager] Falha ao ler "${String(filePath)}": ${(error as Error).message}`
      );
    }
  }

  private fromBuffer(buffer: Buffer): PdfLoadResult {
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: PDF_MIME_TYPE });
    return { blob, source: "buffer", sizeInBytes: blob.size };
  }
}
