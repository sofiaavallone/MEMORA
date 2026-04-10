import { PromptValidationError } from "../errors/index.js";
import type { Flashcard, PromptConfig } from "../types/index.js";

const QUANTIDADE_MIN = 5 as const;
const QUANTIDADE_MAX = 50 as const;

export class FlashcardPromptBuilder {
  public build(config: PromptConfig): string {
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

  private buildPersonaSection(): string {
    return `Você é um professor especialista em Active Recall e elaboração de flashcards acadêmicos de alta qualidade.`;
  }

  private buildDirectivesSection(topico: string, quantidade: number): string {
    return [
      `Analise exclusivamente o documento anexado para criar material de estudo fiel ao documento.`,
      ``,
      `DIRETRIZES OBRIGATÓRIAS:`,
      `1. TÓPICO ALVO: Foque exclusivamente no tema "${topico}".`,
      `2. QUANTIDADE: Gere exatamente ${quantidade} flashcard(s).`,
      `3. FIDELIDADE: Suas respostas devem ser baseadas APENAS no documento fornecido. Não invente informações ou traga dados externos.`,
      `4. TÓPICO AUSENTE: Se o documento NÃO abordar "${topico}", retorne APENAS um array JSON vazio [].`,
      `5. QUALIDADE: Cada pergunta deve exigir compreensão, aplicação, comparação, relação causal ou explicação conceitual — evite memorização mecânica.`,
      `6. RESPOSTAS: Cada resposta deve ser objetiva, porém completa o suficiente para revisão rápida.`,
      `7. IDIOMA: Escreva tudo em português do Brasil.`,
      `8. FORMATO LIMPO: Não inclua markdown, comentários, texto introdutório ou cercas de código.`,
    ].join("\n");
  }

  private buildFormatSection(): string {
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
}
