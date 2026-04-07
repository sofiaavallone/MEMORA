import "dotenv/config";

import { PdfManager } from "../utils/pdfDownloader.js";
import { FlashcardPromptBuilder, type PromptConfig } from "../prompts/flashcardsPrompt.js";
import { GeminiService, GeminiServiceError } from "../services/geminiService.js";
import type { Flashcard } from "../prompts/flashcardsPrompt.js";

// constantes
const TEST_CONFIG = {
    pdfUrl: "https://www.scielo.br/j/csc/a/qyJNfTzPPzWqZ8GYJm4BjLk/?format=pdf&lang=pt",
    promptConfig: {
        topico: "Desigualdade Social e Saúde",
        quantidade: 15,
    } satisfies PromptConfig,
  // "satisfies" valida que o objeto é compatível com PromptConfig em compilação,
  // mas mantém o tipo inferido mais estreito (literal types) — diferente de
  // ": PromptConfig" que alargaria o tipo para string/number genéricos.
} as const;

// instancias compartilhadas
const pdfManager = new PdfManager();
const promptBuilder = new FlashcardPromptBuilder();
const geminiService = new GeminiService();

/**
 * Orquestra o fluxo completo de geração de flashcards.
 * @param pdfSource - URL, caminho local ou Buffer do PDF
 * @param config    - Tópico alvo e quantidade de flashcards
 * @returns         - Array de flashcards prontos para serialização
 * @throws          - Relança qualquer erro após logar — o chamador decide o que fazer
 */
export async function orquestrarGeracaoFlashcards(
    pdfSource: string | Buffer,
    config: PromptConfig
): Promise<Flashcard[]> {

    logInicio(config);

    try {
        // Passo 1: validação e construção do prompt (fail-fast — erros aqui
        // são de entrada do usuário, antes de qualquer I/O custoso acontecer)
        const systemPrompt = promptBuilder.build(config);

        // Passo 2: aquisição do documento (local, URL ou Buffer)
        const { blob, source, sizeInBytes } = await pdfManager.loadPdf(pdfSource);
        logDocumentoAdquirido(source, sizeInBytes);

        // Passo 3: delegação ao serviço de IA
        const flashcards = await geminiService.generateFlashcards(blob, systemPrompt);

        return flashcards;
    } catch (error) {
        // Centralizamos o log de erro aqui — o chamador (run, rota HTTP, etc.)
        // recebe o erro limpo e decide sozinho o que fazer com ele.
        logErro(error);
        throw error;
    }
}

// funções log
function logInicio(config: PromptConfig): void {
    const separador = "=".repeat(50);
    console.log(separador);
    console.log("  Sistema de Geração de Flashcards");
    console.log(`  Tópico:     "${config.topico}"`);
    console.log(`  Quantidade: ${config.quantidade}`);
    console.log(separador + "\n");
}

function logDocumentoAdquirido(source: string, sizeInBytes: number): void {
    // toFixed(2) formata o número com 2 casas decimais: "1.23 MB"
    const tamanhoMb = (sizeInBytes / 1_048_576).toFixed(2); // 1_048_576 = 1024 * 1024
    console.log(`[Controlador] PDF adquirido via '${source}' (${tamanhoMb} MB).\n`);
}

function logErro(error: unknown): void {
    console.error("\n=== FALHA NA OPERAÇÃO ===");

    // "error instanceof Error" faz narrowing: dentro do if, o TypeScript sabe
    // que "error" tem .message e .cause — fora dele, é "unknown" puro.
    if (error instanceof GeminiServiceError) {
        console.error(`Serviço:    ${error.name}`);
        console.error(`Motivo:     ${error.message}`);
        if (error.cause) console.error("Causa raiz:", error.cause);
    } else if (error instanceof Error) {
        console.error(`Motivo: ${error.message}`);
    } else {
        console.error("Erro desconhecido:", error);
    }
}

async function run(): Promise<void> {
    try {
        const resultado = await orquestrarGeracaoFlashcards(
            TEST_CONFIG.pdfUrl,
            TEST_CONFIG.promptConfig
        );

        console.log("\n=== RESULTADO FINAL ===\n");
        console.log(JSON.stringify(resultado, null, 2));
    } catch {
        console.log("\nExecução interrompida. Verifique os logs acima.");
        process.exit(1);
    }
}

// Entrada e teste local
const isEntryPoint = process.argv[1]?.endsWith("requisicao.js") 
                    || process.argv[1]?.endsWith("requisicao.ts");

if (isEntryPoint) {
    run();
}