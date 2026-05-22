/**
 * FlashcardPage.test.tsx
 *
 * Testes GUI para o componente FlashcardPage.
 * Usa: Vitest + @testing-library/react + jsdom
 *
 * Setup necessário:
 *   npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
 *
 * vitest.config.ts:
 *   test: { environment: "jsdom", setupFiles: ["./src/setupTests.ts"] }
 *
 * src/setupTests.ts:
 *   import "@testing-library/jest-dom";
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FlashcardPage } from "../app/flashcardPage";
// ─── Mocks de módulos ─────────────────────────────────────────────────────────

vi.mock("../services/deckService", () => ({
  fetchDeck: vi.fn(),
  reviewFlashcard: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../hooks/useDueCards", () => ({
  useDueCards: () => ({ totalDue: 2 }),
}));

vi.mock("../components/sideBar", () => ({
  SideBar: () => <aside data-testid="sidebar" />,
}));

vi.mock("../components/loginModal", () => ({
  LoginModal: () => null,
}));

vi.mock("../components/registerModal", () => ({
  RegisterModal: () => null,
}));

// Sobrescreve useLocation para simular navegação com state do deck
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      state: { deckId: "deck-001", deckTitle: "Biologia Celular" },
    }),
  };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_CARDS = [
  {
    id: "fc-1",
    question: "O que é mitocôndria?",
    answer: "Organela responsável pela respiração celular.",
  },
  {
    id: "fc-2",
    question: "O que é ribossomo?",
    answer: "Organela responsável pela síntese de proteínas.",
  },
  {
    id: "fc-3",
    question: "O que é núcleo?",
    answer: "Centro de controle da célula, contém o DNA.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Renderiza a página e aguarda o primeiro card aparecer */
async function setup() {
  render(
    <MemoryRouter>
      <FlashcardPage />
    </MemoryRouter>
  );
  await waitFor(() =>
    expect(screen.getByText(MOCK_CARDS[0].question)).toBeInTheDocument()
  );
}

/** Clica no card para revelar a resposta */
function flipCard() {
  fireEvent.click(screen.getByText(/clique para revelar/i));
}

/** Avança N cards */
function goNext(times = 1) {
  for (let i = 0; i < times; i++) {
    fireEvent.click(screen.getByLabelText(/próximo flashcard/i));
  }
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("FlashcardPage", () => {
  let fetchDeck: ReturnType<typeof vi.fn>;
  let reviewFlashcard: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("../services/deckService");
    fetchDeck     = mod.fetchDeck      as ReturnType<typeof vi.fn>;
    reviewFlashcard = mod.reviewFlashcard as ReturnType<typeof vi.fn>;
    fetchDeck.mockResolvedValue({ flashcards: MOCK_CARDS });
  });

  // ── 1. Carregamento ───────────────────────────────────────────────────────

  describe("1 · Carregamento", () => {
    it("exibe o spinner enquanto os dados estão sendo buscados", () => {
      fetchDeck.mockReturnValue(new Promise(() => {})); // nunca resolve
      render(
        <MemoryRouter>
          <FlashcardPage />
        </MemoryRouter>
      );
      expect(screen.getByText(/carregando flashcards/i)).toBeInTheDocument();
    });

    it("oculta o spinner após o carregamento", async () => {
      await setup();
      expect(screen.queryByText(/carregando flashcards/i)).toBeNull();
    });

    it("exibe o título do deck após o carregamento", async () => {
      await setup();
      expect(screen.getByText("Biologia Celular")).toBeInTheDocument();
    });

    it("exibe o subtítulo 'Flashcards'", async () => {
      await setup();
      expect(screen.getByText("Flashcards")).toBeInTheDocument();
    });
  });

  // ── 2. Exibição do card (frente) ──────────────────────────────────────────

  describe("2 · Frente do card", () => {
    it("exibe o rótulo PERGUNTA", async () => {
      await setup();
      expect(screen.getByText(/^pergunta$/i)).toBeInTheDocument();
    });

    it("exibe o texto da pergunta do primeiro card", async () => {
      await setup();
      expect(screen.getByText("O que é mitocôndria?")).toBeInTheDocument();
    });

    it("exibe a dica 'Clique para revelar'", async () => {
      await setup();
      expect(screen.getByText(/clique para revelar/i)).toBeInTheDocument();
    });

    it("não exibe botões Acertei/Errei antes do flip", async () => {
      await setup();
      expect(screen.queryByRole("button", { name: /acertei/i })).toBeNull();
      expect(screen.queryByRole("button", { name: /errei/i })).toBeNull();
    });
  });

  // ── 3. Flip do card ───────────────────────────────────────────────────────

  describe("3 · Flip do card", () => {
    it("exibe o rótulo RESPOSTA após o flip", async () => {
      await setup();
      flipCard();
      expect(screen.getByText(/^resposta$/i)).toBeInTheDocument();
    });

    it("exibe o texto da resposta após o flip", async () => {
      await setup();
      flipCard();
      expect(
        screen.getByText("Organela responsável pela respiração celular.")
      ).toBeInTheDocument();
    });

    it("exibe os botões Acertei e Errei após o flip", async () => {
      await setup();
      flipCard();
      expect(screen.getByRole("button", { name: /acertei/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /errei/i })).toBeInTheDocument();
    });

    it("fecha o flip ao avançar para o próximo card", async () => {
      await setup();
      flipCard();
      goNext();
      expect(screen.getByText(/clique para revelar/i)).toBeInTheDocument();
    });
  });

  // ── 4. Marcação de resposta ───────────────────────────────────────────────

  describe("4 · Marcação de resposta", () => {
    it("exibe feedback '✓ Marcado como acerto' ao clicar em Acertei", async () => {
      await setup();
      flipCard();
      fireEvent.click(screen.getByRole("button", { name: /acertei/i }));
      await waitFor(() =>
        expect(screen.getByText(/marcado como acerto/i)).toBeInTheDocument()
      );
    });

    it("exibe feedback '✕ Marcado como erro' ao clicar em Errei", async () => {
      await setup();
      flipCard();
      fireEvent.click(screen.getByRole("button", { name: /errei/i }));
      await waitFor(() =>
        expect(screen.getByText(/marcado como erro/i)).toBeInTheDocument()
      );
    });

    it("exibe '1 acertos' e '0 erros' após um acerto", async () => {
      await setup();
      flipCard();
      fireEvent.click(screen.getByRole("button", { name: /acertei/i }));
      await waitFor(() => {
        expect(screen.getByText(/1 acertos/i)).toBeInTheDocument();
        expect(screen.getByText(/0 erros/i)).toBeInTheDocument();
      });
    });

    it("exibe '0 acertos' e '1 erros' após um erro", async () => {
      await setup();
      flipCard();
      fireEvent.click(screen.getByRole("button", { name: /errei/i }));
      await waitFor(() => {
        expect(screen.getByText(/0 acertos/i)).toBeInTheDocument();
        expect(screen.getByText(/1 erros/i)).toBeInTheDocument();
      });
    });

    it("chama reviewFlashcard com 'correct' ao acertar", async () => {
      await setup();
      flipCard();
      fireEvent.click(screen.getByRole("button", { name: /acertei/i }));
      await waitFor(() =>
        expect(reviewFlashcard).toHaveBeenCalledWith(
          "fc-1",
          "correct",
          expect.any(Number)
        )
      );
    });

    it("chama reviewFlashcard com 'incorrect' ao errar", async () => {
      await setup();
      flipCard();
      fireEvent.click(screen.getByRole("button", { name: /errei/i }));
      await waitFor(() =>
        expect(reviewFlashcard).toHaveBeenCalledWith(
          "fc-1",
          "incorrect",
          expect.any(Number)
        )
      );
    });

    it("oculta os botões Acertei/Errei após a marcação", async () => {
      await setup();
      flipCard();
      fireEvent.click(screen.getByRole("button", { name: /acertei/i }));
      await waitFor(() => {
        expect(screen.queryByRole("button", { name: /acertei/i })).toBeNull();
        expect(screen.queryByRole("button", { name: /errei/i })).toBeNull();
      });
    });
  });

  // ── 5. Navegação entre cards ──────────────────────────────────────────────

  describe("5 · Navegação", () => {
    it("avança para o segundo card ao clicar em próximo", async () => {
      await setup();
      goNext();
      expect(screen.getByText("O que é ribossomo?")).toBeInTheDocument();
    });

    it("retorna ao card anterior ao clicar em anterior", async () => {
      await setup();
      goNext();
      fireEvent.click(screen.getByLabelText(/flashcard anterior/i));
      expect(screen.getByText("O que é mitocôndria?")).toBeInTheDocument();
    });

    it("botão anterior está desabilitado no primeiro card", async () => {
      await setup();
      expect(screen.getByLabelText(/flashcard anterior/i)).toBeDisabled();
    });

    it("botão próximo está desabilitado no último card", async () => {
      await setup();
      goNext(2); // vai até o card 3 (último)
      expect(screen.getByLabelText(/próximo flashcard/i)).toBeDisabled();
    });

    it("botão anterior é habilitado ao sair do primeiro card", async () => {
      await setup();
      goNext();
      expect(screen.getByLabelText(/flashcard anterior/i)).not.toBeDisabled();
    });

    it("botão próximo é habilitado ao voltar do último card", async () => {
      await setup();
      goNext(2);
      fireEvent.click(screen.getByLabelText(/flashcard anterior/i));
      expect(screen.getByLabelText(/próximo flashcard/i)).not.toBeDisabled();
    });
  });

  // ── 6. Barra de progresso ─────────────────────────────────────────────────

  describe("6 · Barra de progresso", () => {
    it("exibe '1 / 3' ao iniciar", async () => {
      await setup();
      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("atualiza para '2 / 3' ao avançar um card", async () => {
      await setup();
      goNext();
      expect(screen.getByText("2 / 3")).toBeInTheDocument();
    });

    it("atualiza para '3 / 3' no último card", async () => {
      await setup();
      goNext(2);
      expect(screen.getByText("3 / 3")).toBeInTheDocument();
    });
  });

  // ── 7. Reiniciar ──────────────────────────────────────────────────────────

  describe("7 · Reiniciar", () => {
    it("volta para o primeiro card ao reiniciar", async () => {
      await setup();
      goNext(2);
      fireEvent.click(screen.getByRole("button", { name: /reiniciar/i }));
      expect(screen.getByText("O que é mitocôndria?")).toBeInTheDocument();
    });

    it("exibe '1 / 3' após reiniciar", async () => {
      await setup();
      goNext(2);
      fireEvent.click(screen.getByRole("button", { name: /reiniciar/i }));
      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("limpa os resultados anteriores ao reiniciar", async () => {
      await setup();
      flipCard();
      fireEvent.click(screen.getByRole("button", { name: /acertei/i }));
      await waitFor(() => screen.getByText(/marcado como acerto/i));

      fireEvent.click(screen.getByRole("button", { name: /reiniciar/i }));

      expect(screen.queryByText(/marcado como acerto/i)).toBeNull();
    });

    it("fecha o flip ao reiniciar", async () => {
      await setup();
      flipCard();
      fireEvent.click(screen.getByRole("button", { name: /reiniciar/i }));
      expect(screen.getByText(/clique para revelar/i)).toBeInTheDocument();
    });
  });

  // ── 8. Estados de erro ────────────────────────────────────────────────────

  describe("8 · Estados de erro", () => {
    it("exibe mensagem de erro quando a API falha", async () => {
      fetchDeck.mockRejectedValue(new Error("network error"));
      render(
        <MemoryRouter>
          <FlashcardPage />
        </MemoryRouter>
      );
      await waitFor(() =>
        expect(
          screen.getByText(/não foi possível carregar os flashcards/i)
        ).toBeInTheDocument()
      );
    });

    it("exibe aviso quando o deck não possui flashcards", async () => {
      fetchDeck.mockResolvedValue({ flashcards: [] });
      render(
        <MemoryRouter>
          <FlashcardPage />
        </MemoryRouter>
      );
      await waitFor(() =>
        expect(
          screen.getByText(/este deck não possui flashcards/i)
        ).toBeInTheDocument()
      );
    });

    it("exibe botão 'Voltar para Decks' em estado de erro", async () => {
      fetchDeck.mockRejectedValue(new Error("network error"));
      render(
        <MemoryRouter>
          <FlashcardPage />
        </MemoryRouter>
      );
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /voltar para decks/i })
        ).toBeInTheDocument()
      );
    });
  });
});
