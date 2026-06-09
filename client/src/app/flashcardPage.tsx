import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Loader2 } from "lucide-react";
import { SideBar } from "../components/sideBar";
import { LoginModal } from "../components/loginModal";
import { RegisterModal } from "../components/registerModal";
import { fetchDeck, reviewFlashcard, type FlashcardAPI } from "../services/deckService";
import { useDueCards } from "../hooks/useDueCards";

type AnswerStatus = "correct" | "wrong" | null;

export function FlashcardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalDue } = useDueCards();

  const routeState = location.state as
    | { deckId?: string; deckTitle?: string }
    | undefined;

  const deckId = routeState?.deckId ?? null;
  const deckTitle = routeState?.deckTitle ?? "Sem nome";

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [flashcards, setFlashcards] = useState<FlashcardAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<AnswerStatus[]>([]);

  const cardStartRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!deckId) {
      setError("Deck não encontrado.");
      setLoading(false);
      return;
    }

    fetchDeck(deckId)
      .then((deck) => {
        const cards = deck.flashcards ?? [];
        setFlashcards(cards);
        setResults(Array(cards.length).fill(null));
      })
      .catch(() => setError("Não foi possível carregar os flashcards."))
      .finally(() => setLoading(false));
  }, [deckId]);

  useEffect(() => {
    cardStartRef.current = Date.now();
  }, [currentIndex]);

  const currentCard = flashcards[currentIndex];
  const currentResult = results[currentIndex];

  const correctCount = results.filter((r) => r === "correct").length;
  const wrongCount = results.filter((r) => r === "wrong").length;
  const progressPercentage = flashcards.length
    ? ((currentIndex + 1) / flashcards.length) * 100
    : 0;

  const handleFlipCard = () => setIsFlipped((prev) => !prev);

  const handleMarkAnswer = async (status: "correct" | "wrong") => {
    const durationSec = Math.round((Date.now() - cardStartRef.current) / 1000);

    const updatedResults = [...results];
    updatedResults[currentIndex] = status;
    setResults(updatedResults);

    if (currentCard?.id) {
      try {
        await reviewFlashcard(
          currentCard.id,
          status === "correct" ? "correct" : "incorrect",
          durationSec
        );
      } catch {
        console.warn("[FlashcardPage] Falha ao registrar resposta na API.");
      }
    }
  };

  const handlePreviousCard = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
    setIsFlipped(false);
  };

  const handleNextCard = () => {
    if (currentIndex === flashcards.length - 1) return;
    setCurrentIndex((prev) => prev + 1);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults(Array(flashcards.length).fill(null));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
        <div className="flex flex-col items-center gap-3 text-[#6b7a99]">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-[14px]">Carregando flashcards...</p>
        </div>
      </div>
    );
  }

  if (error || flashcards.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
        <div className="text-center">
          <p className="text-[14px] text-[#ff4d5f]">
            {error ?? "Este deck não possui flashcards."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/decks")}
            className="mt-4 text-[14px] text-[#9b4ca0] underline underline-offset-2"
          >
            Voltar para Decks
          </button>
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
          activeItem="decks"
          onLoginClick={() => setIsLoginModalOpen(true)}
        />

        <main className="flex-1 px-10 py-8">
          <section className="mx-auto w-full max-w-[825px]">
            {/* Cabeçalho */}
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => navigate("/decks")}
                className="mt-4 text-[#6b7a99] transition-colors duration-200 hover:text-[#24172b]"
                aria-label="Voltar para decks"
              >
                <ArrowLeft size={22} strokeWidth={1.8} />
              </button>

              <div>
                <h1 className="font-heading text-[24px] font-semibold text-[#24172b]">
                  {deckTitle}
                </h1>
                <p className="text-[14px] font-light text-[#6b7a99]">Flashcards</p>
              </div>
            </div>

            {/* Barra de progresso */}
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
                onClick={handleFlipCard}
                className="h-[270px] w-full bg-transparent text-left"
              >
                <div
                  className={`relative h-full w-full rounded-[16px] border border-[#d9dde7] bg-white transition-transform duration-500 [transform-style:preserve-3d] ${
                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                >
                  {/* Frente — Pergunta */}
                  <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-[24px] bg-white px-10 [backface-visibility:hidden]">
                    <p className="mb-3 text-[12px] font-normal uppercase tracking-[0.10em] text-[#7c89a3]">
                      Pergunta
                    </p>
                    <h2 className="max-w-[720px] text-center font-heading text-[20px] font-semibold text-[#24172b]">
                      {currentCard?.question}
                    </h2>
                    <p className="mt-6 text-[12px] text-[#6b7a99]">
                      Clique para revelar
                    </p>
                  </div>

                  {/* Verso — Resposta */}
                  <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-[24px] bg-white px-10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="mb-3 text-[12px] font-normal uppercase tracking-[0.10em] text-[#9b4ca0]">
                      Resposta
                    </p>
                    <h2 className="max-w-[760px] text-center text-[18px] font-normal text-[#24172b]">
                      {currentCard?.answer}
                    </h2>
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
                      className="h-[40px] rounded-[12px] bg-[#f9e3e6] text-[14px] font-normal text-[#ff4d5f] transition-colors duration-200 hover:bg-[#f6d7dc]"
                    >
                      ✕ Errei
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkAnswer("correct")}
                      className="h-[40px] rounded-[12px] bg-[#dff0ea] text-[14px] font-normal text-[#12b76a] transition-colors duration-200 hover:bg-[#d3e9e2]"
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

                    <div className="mt-5 flex items-center justify-center gap-5 text-[14px] font-normal">
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
                onClick={handlePreviousCard}
                disabled={currentIndex === 0}
                className={`text-[#6b7a99] transition-colors duration-200 ${
                  currentIndex === 0
                    ? "cursor-not-allowed opacity-40"
                    : "hover:text-[#24172b]"
                }`}
                aria-label="Flashcard anterior"
              >
                <ChevronLeft size={24} strokeWidth={2.2} />
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="flex items-center gap-2 text-[13px] font-normal text-[#6b7a99] transition-colors duration-200 hover:text-[#24172b]"
              >
                <RotateCcw size={16} strokeWidth={2} />
                Reiniciar
              </button>

              <button
                type="button"
                onClick={handleNextCard}
                disabled={currentIndex === flashcards.length - 1}
                className={`text-[#6b7a99] transition-colors duration-200 ${
                  currentIndex === flashcards.length - 1
                    ? "cursor-not-allowed opacity-40"
                    : "hover:text-[#24172b]"
                }`}
                aria-label="Próximo flashcard"
              >
                <ChevronRight size={24} strokeWidth={2.2} />
              </button>
            </div>
          </section>
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
