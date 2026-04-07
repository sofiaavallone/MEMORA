// Constantes
const QUANTIDADE_MIN = 5 as const;
const QUANTIDADE_MAX = 50 as const;

// Intefaces
export interface Flashcard {
  pergunta: string;
  resposta: string;
}

// "Readonly<T>" é um utilitário built-in do TypeScript que transforma todas as
// propriedades de T em somente-leitura. Isso impede mutações acidentais como
// config.topico = "" dentro de qualquer função que receba um PromptConfig.
export type PromptConfig = Readonly<{
  topico: string;
  quantidade: number;
}>;

// Tratar erros:
// Extender Error com classes específicas tem dois benefícios:
// (1) catch(e) { if (e instanceof PromptValidationError) } — permite tratar
//     erros de validação de forma diferente de outros erros em runtime.
// (2) e.name fica "PromptValidationError" no stack trace — muito mais fácil
//     de debugar do que um genérico "Error".
export class PromptValidationError extends Error {
    // "override" instrui o TypeScript a confirmar que estamos sobrescrevendo
    // uma propriedade que já existe na classe pai (Error). Sem "override",
    // o TS não avisa se a propriedade pai mudar de nome num update futuro.
    override readonly name = "PromptValidationError" as const;

    constructor(message: string) {
        // "super()" chama o construtor da classe pai (Error) passando a mensagem.
        // Obrigatório em qualquer classe que extende outra.
        super(message);
    }
}

// Classe principal
/**
 * Isola a engenharia de prompt para geração de flashcards via LLM.
 *
 * Responsabilidades:
 * - Validar os parâmetros de entrada (fail-fast).
 * - Construir o system prompt final com as variáveis injetadas.
 *
 * @example
 * const builder = new FlashcardPromptBuilder();
 * const prompt = builder.build({ topico: "TypeScript", quantidade: 10 });
 */
export class FlashcardPromptBuilder {
  // Validar
    private validate(config: PromptConfig): void {
        const topico = config.topico.trim();

        if (topico.length === 0) {
            throw new PromptValidationError(
                "[FlashcardPromptBuilder] O tópico não pode ser vazio."
            );
        }

        if (
            !Number.isInteger(config.quantidade) ||
            config.quantidade < QUANTIDADE_MIN ||
            config.quantidade > QUANTIDADE_MAX
        ) {
            throw new PromptValidationError(
                `[FlashcardPromptBuilder] Quantidade inválida: ${config.quantidade}. ` +
                `Deve ser um inteiro entre ${QUANTIDADE_MIN} e ${QUANTIDADE_MAX}.`
            );
        }
    }

  // Prompt

    private buildPersonaSection(): string {
        return `Você é um professor especialista na criação de materiais de estudo baseados na técnica de Recuperação Ativa (Active Recall).`;
    }

    private buildDirectivesSection(topico: string, quantidade: number): string {
        return [
            `Sua tarefa é analisar o documento anexado e extrair o conhecimento essencial.`,
            ``,
            `DIRETRIZES OBRIGATÓRIAS:`,
            `1. TÓPICO ALVO: Foque exclusivamente no tema "${topico}".`,
            `2. QUANTIDADE: Gere exatamente ${quantidade} flashcard(s).`,
            `3. FIDELIDADE: Suas respostas devem ser baseadas APENAS no documento fornecido. Não invente informações ou traga dados externos.`,
            `4. TÓPICO AUSENTE: Se o documento NÃO abordar "${topico}", retorne APENAS um array JSON vazio [].`,
        ].join("\n");
    }

    private buildFormatSection(): string {
        // JSON.stringify com indentação garante que o exemplo no prompt seja
        // sempre JSON válido — impossível introduzir um typo manual aqui.
        const exemplo: Flashcard[] = [
        {
            pergunta: "Escreva a pergunta desafiadora aqui",
            resposta: "Escreva a resposta direta e objetiva aqui",
        },
        ];

        return [
            `FORMATO DE SAÍDA:`,
            `Sua resposta DEVE ser estritamente um Array JSON válido.`,
            `Não inclua formatações de markdown como \`\`\`json. Retorne apenas a estrutura bruta:`,
            ``,
            JSON.stringify(exemplo, null, 2),
        ].join("\n");
    }

  // Metodo publico de entrada
    public build(config: PromptConfig): string {
        // Fail-fast: valida antes de qualquer trabalho.
        // Se lançar PromptValidationError, nenhuma linha abaixo executa.
        this.validate(config);

        const topico = config.topico.trim();
        const { quantidade } = config;

        const secoes = [
            this.buildPersonaSection(),
            this.buildDirectivesSection(topico, quantidade),
            this.buildFormatSection(),
        ];

        return secoes.join("\n\n");
    }
}