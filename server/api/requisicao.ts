import dotenv from "dotenv";
dotenv.config();

import { FlashcardPromptBuilder } from "../src/prompts/FlashcardPromptBuilder.js";
import { PdfManager } from "../src/utils/PdfManager.js";
import { GeminiService } from "../src/services/GeminiService.js";

async function testarSistema(): Promise<void> {
  const pdfManager = new PdfManager();
  const promptBuilder = new FlashcardPromptBuilder();
  const geminiService = new GeminiService();

  const linkPDF = "https://www.scielo.br/j/csc/a/qyJNfTzPPzWqZ8GYJm4BjLk/?format=pdf&lang=pt";
  const topico = "saúde pública";
  const quantidade = 5;

  console.log("[Teste] Iniciando geração de flashcards...");
  console.log(`[Teste] PDF: ${linkPDF}`);
  console.log(`[Teste] Tópico: ${topico}`);
  console.log(`[Teste] Quantidade: ${quantidade}`);

  try {
    // 1. Construir o prompt
    const prompt = promptBuilder.build({ topico, quantidade });
    console.log("[Teste] Prompt construído com sucesso.");

    // 2. Baixar o PDF
    const { blob, sizeInBytes } = await pdfManager.loadPdf(linkPDF);
    console.log(`[Teste] PDF baixado com sucesso. Tamanho: ${sizeInBytes} bytes.`);

    // 3. Gerar flashcards via Gemini
    const flashcards = await geminiService.generateFlashcards(blob, prompt);

    console.log("\n=== RESULTADO FINAL ===");
    console.log(JSON.stringify(flashcards, null, 2));
    console.log(`\n[Teste] Total de flashcards gerados: ${flashcards.length}`);
  } catch (error) {
    console.error("[Teste] Erro ao gerar flashcards:", error);
    process.exitCode = 1;
  }
}

const isEntryPoint = import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, "/")}`;

if (isEntryPoint) {
  testarSistema();
}
