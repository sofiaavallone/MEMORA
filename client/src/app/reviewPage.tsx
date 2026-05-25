import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PartyPopper,
  Layers3,
} from "lucide-react";
import { SideBar } from "../components/sideBar";
import { LoginModal } from "../components/loginModal";
import { RegisterModal } from "../components/registerModal";
import { reviewFlashcard, type FlashcardAPI } from "../services/deckService";
import { useDueCards, type DeckDue } from "../hooks/useDueCards";
import { useAuthStore } from "../store/useAuthStore";

type AnswerStatus = "correct" | "wrong" | null;


function DeckSelector({
  byDeck,
  onSelect,
}: {
  byDeck: DeckDue[];
  onSelect: (deck: DeckDue) => void;
}) {
  return (
    <div className="w-full max-w-[540px]">
      <h1 className="font-heading text-[24px] font-semibold text-[#24172b]">
        Revisão Diária
      </h1>
      <p className="mt-1 text-[14px] text-[#6b7a99]">
        Escolha qual deck revisar agora.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {byDeck.map((deck) => (
          <button
            key={deck.deckId}
            type="button"
            onClick={() => onSelect(deck)}
            className="flex items-center justify-between rounded-[14px] border border-[#d9dde7] bg-white px-5 py-4 text-left transition-all hover:border-[#9b4ca0] hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#f3ebf4] text-[#9b4ca0]">
                <Layers3 size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[15px] font-medium text-[#24172b]">{deck.deckTitle}</p>
                <p className="text-[12px] text-[#6b7a99]">
                  {deck.cards.length} card{deck.cards.length !== 1 ? "s" : ""} para revisar
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#9b4ca0]" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}


function SessionSummary({
  total,
  correctCount,
  wrongCount,
  onBack,
  onHome,
}: {
  total: number;
  correctCount: number;
  wrongCount: number;
  onBack: () => void;
  onHome: () => void;
}) {
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div className="w-full max-w-[480px] rounded-[20px] border border-[#d9dde7] bg-white p-10 text-center">
      <PartyPopper size={48} className="mx-auto mb-4 text-[#9b4ca0]" />
      <h2 className="font-heading text-[24px] font-semibold text-[#24172b]">
        Deck concluído!
      </h2>
      <p className="mt-2 text-[14px] text-[#6b7a99]">
        Você revisou {total} cards neste deck.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-[14px] bg-[#f8f9fb] p-4">
          <p className="text-[22px] font-semibold text-[#24172b]">{total}</p>
          <p className="mt-1 text-[12px] text-[#6b7a99]">Revisados</p>
        </div>
        <div className="rounded-[14px] bg-[#dff0ea] p-4">
          <p className="text-[22px] font-semibold text-[#12b76a]">{correctCount}</p>
          <p className="mt-1 text-[12px] text-[#6b7a99]">Acertos</p>
        </div>
        <div className="rounded-[14px] bg-[#f9e3e6] p-4">
          <p className="text-[22px] font-semibold text-[#ff4d5f]">{wrongCount}</p>
          <p className="mt-1 text-[12px] text-[#6b7a99]">Erros</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-[12px] text-[#6b7a99]">
          <span>Taxa de acerto</span>
          <span className="font-medium text-[#24172b]">{pct}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-[#eee7ef]">
          <div
            className="h-2 rounded-full bg-[#9b4ca0] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="mt-5 text-[12px] text-[#aab0bf]">
        Cards errados voltam amanhã. Acertos foram agendados pelo SM-2.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-[12px] border border-[#d9dde7] py-2.5 text-[14px] font-medium text-[#6b7a99] hover:bg-[#f8f9fb]"
        >
          Outros decks
        </button>
        <button
          type="button"
          onClick={onHome}
          className="flex-1 rounded-[12px] bg-[#9b4ca0] py-2.5 text-[14px] font-medium text-white hover:bg-[#b15bb4]"
        >
          Início
        </button>
      </div>
    </div>
  );
}

function DeckReviewSession({
  deck,
  onBack,
  onFinish,
}: {
  deck: DeckDue;
  onBack: () => void;
  onFinish: (correct: number, wrong: number) => void;
}) {
  const flashcards: FlashcardAPI[] = deck.cards;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<AnswerStatus[]>(
    Array(flashcards.length).fill(null)
  );

  const cardStartRef = useRef<number>(Date.now());

  const currentCard = flashcards[currentIndex];
  const currentResult = results[currentIndex];
  const correctCount = results.filter((r) => r === "correct").length;
  const wrongCount = results.filter((r) => r === "wrong").length;
  const progressPercentage = ((currentIndex + 1) / flashcards.length) * 100;

  const handleMarkAnswer = async (status: "correct" | "wrong") => {
    const durationSec = Math.round((Date.now() - cardStartRef.current) / 1000);

    const updated = [...results];
    updated[currentIndex] = status;
    setResults(updated);

    if (currentCard?.id) {
      reviewFlashcard(
        currentCard.id,
        status === "correct" ? "correct" : "incorrect",
        durationSec
      ).catch(() => console.warn("[ReviewPage] Falha ao registrar resposta."));
    }

    if (currentIndex === flashcards.length - 1) {
      const finalCorrect = updated.filter((r) => r === "correct").length;
      const finalWrong = updated.filter((r) => r === "wrong").length;
      setTimeout(() => onFinish(finalCorrect, finalWrong), 500);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      cardStartRef.current = Date.now();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      cardStartRef.current = Date.now();
    }
  };

  return (
    <div className="w-full max-w-[825px]">
      {/* Cabeçalho */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-[#6b7a99] transition-colors hover:text-[#24172b]"
          aria-label="Voltar para seleção de deck"
        >
          <ArrowLeft size={22} strokeWidth={1.8} />
        </button>
        <div>
          <h1 className="font-heading text-[24px] font-semibold text-[#24172b]">
            {deck.deckTitle}
          </h1>
          <p className="text-[14px] font-light text-[#6b7a99]">Revisão Diária</p>
        </div>
      </div>

      {/* Progresso */}
      <div className="mt-8">
        <div className="h-1.5 w-full rounded-full bg-[#eee7ef]">
          <div
            className="h-1.5 rounded-full bg-[#9b4ca0] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="mt-3 text-right text-[14px] text-[#6b7a99]">
          {currentIndex + 1} / {flashcards.length}
        </p>
      </div>

      {/* Card com flip */}
      <div className="mt-6 [perspective:1200px]">
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="h-[270px] w-full bg-transparent text-left"
        >
          <div
            className={`relative h-full w-full rounded-[16px] border border-[#d9dde7] bg-white transition-transform duration-500 [transform-style:preserve-3d] ${
              isFlipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            {/* Frente */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[24px] bg-white px-10 [backface-visibility:hidden]">
              <p className="mb-3 text-[12px] uppercase tracking-[0.10em] text-[#7c89a3]">
                Pergunta
              </p>
              <h2 className="max-w-[720px] text-center font-heading text-[20px] font-semibold text-[#24172b]">
                {currentCard?.question}
              </h2>
              <p className="mt-6 text-[12px] text-[#6b7a99]">Clique para revelar</p>
            </div>

            {/* Verso */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[24px] bg-white px-10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <p className="mb-3 text-[12px] uppercase tracking-[0.10em] text-[#9b4ca0]">
                Resposta
              </p>
              <h2 className="max-w-[760px] text-center text-[18px] text-[#24172b]">
                {currentCard?.answer}
              </h2>
              <p className="mt-4 text-[11px] text-[#aab0bf]">
                Acerto → próxima revisão em {currentCard?.interval ?? 1} dia(s) · Erro → amanhã
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Botões de resposta */}
      {isFlipped && (
        <div className="mt-6">
          {currentResult === null ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleMarkAnswer("wrong")}
                className="h-[40px] rounded-[12px] bg-[#f9e3e6] text-[14px] text-[#ff4d5f] transition-colors hover:bg-[#f6d7dc]"
              >
                ✕ Errei
              </button>
              <button
                type="button"
                onClick={() => handleMarkAnswer("correct")}
                className="h-[40px] rounded-[12px] bg-[#dff0ea] text-[14px] text-[#12b76a] transition-colors hover:bg-[#d3e9e2]"
              >
                ✓ Acertei
              </button>
            </div>
          ) : (
            <div>
              <div
                className={`flex h-[40px] items-center justify-center rounded-[12px] text-[14px] font-medium ${
                  currentResult === "correct"
                    ? "bg-[#dff0ea] text-[#12b76a]"
                    : "bg-[#f9e3e6] text-[#ff4d5f]"
                }`}
              >
                {currentResult === "correct"
                  ? "✓ Marcado como acerto"
                  : "✕ Marcado como erro"}
              </div>

              <div className="mt-5 flex items-center justify-center gap-5 text-[14px]">
                <span className="text-[#12b76a]">{correctCount} acertos</span>
                <span className="text-[#d9dde7]">•</span>
                <span className="text-[#ff4d5f]">{wrongCount} erros</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navegação */}
      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`text-[#6b7a99] transition-colors ${
            currentIndex === 0 ? "cursor-not-allowed opacity-40" : "hover:text-[#24172b]"
          }`}
        >
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>

        {currentResult !== null && currentIndex < flashcards.length - 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-[10px] bg-[#9b4ca0] px-5 py-2 text-[13px] font-medium text-white hover:bg-[#b15bb4]"
          >
            Próximo →
          </button>
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className={`text-[#6b7a99] transition-colors ${
            currentIndex === flashcards.length - 1
              ? "cursor-not-allowed opacity-40"
              : "hover:text-[#24172b]"
          }`}
        >
          <ChevronRight size={24} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}


type ReviewState =
  | { screen: "select" }
  | { screen: "session"; deck: DeckDue }
  | { screen: "summary"; correct: number; wrong: number; total: number };

export function ReviewPage() {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [state, setState] = useState<ReviewState>({ screen: "select" });

  const { user } = useAuthStore();
  const { totalDue, byDeck, loading, error, refresh } = useDueCards();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
        <div className="flex flex-col items-center gap-3 text-[#6b7a99]">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-[14px]">Carregando revisão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="flex">
        <SideBar
          reviewCardsCount={totalDue}
          reviewProgressPercentage={totalDue === 0 ? 100 : 0}
          activeItem="review"
          onLoginClick={() => setIsLoginModalOpen(true)}
        />

        <main className="flex flex-1 items-start justify-center px-10 py-12">
          {error && (
            <p className="text-[14px] text-[#ff4d5f]">{error}</p>
          )}

          {!error && state.screen === "select" && byDeck.length === 0 && (
            <div className="text-center">
              <div className="mb-4 text-[48px]">🎉</div>
              <h2 className="font-heading text-[22px] font-semibold text-[#24172b]">
                Tudo em dia!
              </h2>
              <p className="mt-2 text-[14px] text-[#6b7a99]">
                Nenhum card pendente para hoje. Volte amanhã!
              </p>
              <button
                type="button"
                onClick={() => navigate("/decks")}
                className="mt-6 rounded-[12px] bg-[#9b4ca0] px-6 py-2.5 text-[14px] font-medium text-white hover:bg-[#b15bb4]"
              >
                Ver Meus Decks
              </button>
            </div>
          )}

          {!error && state.screen === "select" && byDeck.length > 0 && (
            <DeckSelector
              byDeck={byDeck}
              onSelect={(deck) => setState({ screen: "session", deck })}
            />
          )}

          {state.screen === "session" && (
            <DeckReviewSession
              deck={state.deck}
              onBack={() => setState({ screen: "select" })}
              onFinish={(correct, wrong) => {
                refresh();
                setState({
                  screen: "summary",
                  correct,
                  wrong,
                  total: state.deck.cards.length,
                });
              }}
            />
          )}

          {state.screen === "summary" && (
            <SessionSummary
              total={state.total}
              correctCount={state.correct}
              wrongCount={state.wrong}
              onBack={() => {
                setState({ screen: "select" });
              }}
              onHome={() => navigate("/")}
            />
          )}
        </main>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onCreateAccountClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
}
