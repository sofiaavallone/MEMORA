import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { SideBar } from "../components/sideBar";
import { LoginModal } from "../components/loginModal";
import { RegisterModal } from "../components/registerModal";

type Flashcard = {
    question: string;
    answer: string;
};

type AnswerStatus = "correct" | "wrong" | null;

export function FlashcardPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const routeState = location.state as | {
      deckTitle?: string;
      flashcards?: { question: string; answer: string }[];
    } | undefined;

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const deckTitle = routeState?.deckTitle ?? "Sem nome";

    const flashcards: Flashcard[] = routeState?.flashcards ?? [
        {
        question: "O que é a mitocôndria?",
        answer: "Organela responsável pela produção de ATP através da respiração celular.",
        },
        {
        question: "Qual é a função do ribossomo?",
        answer: "Realizar a síntese de proteínas a partir da tradução do RNA mensageiro.",
        },
        {
        question: "O que caracteriza a membrana plasmática?",
        answer: "Ela delimita a célula e controla a entrada e saída de substâncias.",
        },
    ];

        const [currentIndex, setCurrentIndex] = useState(0);
        const [isFlipped, setIsFlipped] = useState(false);
        const [results, setResults] = useState<AnswerStatus[]>(
            Array(flashcards.length).fill(null)
        );

        const currentCard = flashcards[currentIndex];
        const currentResult = results[currentIndex];

        const correctCount = results.filter((result) => result === "correct").length;
        const wrongCount = results.filter((result) => result === "wrong").length;

        const progressPercentage = ((currentIndex + 1) / flashcards.length) * 100;

        const handleFlipCard = (): void => {
            setIsFlipped((prev) => !prev);
        };

        const handleMarkAnswer = (status: Exclude<AnswerStatus, null>): void => {
            const updatedResults = [...results];
            updatedResults[currentIndex] = status;
            setResults(updatedResults);
        };

        const handlePreviousCards = (): void => {
            if (currentIndex === 0) return;

            setCurrentIndex((prev) => prev - 1);
            setIsFlipped(false);
        };

        const handleNextCard = (): void => {
            if (currentIndex === flashcards.length - 1) return;

            setCurrentIndex((prev) => prev + 1);
            setIsFlipped(false);
        };

        const handleRestart = (): void => {
            setCurrentIndex(0);
            setIsFlipped(false);
            setResults(Array(flashcards.length).fill(null));
        };

        return (
            <div className="min-h-screen bg-[#f8f8f8]">
                <div className="flex">
                    <SideBar
                        reviewCardsCount={12}
                        reviewProgressPercentage={70}
                        activeItem="decks"
                        onLoginClick={() => setIsLoginModalOpen(true)}
                    />

                    <main className="flex-1 px-10 py-8">
                        <section className="mx-auto w-full max-w-[825px]">
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

                                    <p className="text-[14px] font-light text-[#6b7a99]">
                                        Flashcards
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="h-1.5 w-full rounded-full bg-[#eee7ef]">
                                    <div className="h-1.5 rounded-full bg-[#9b4ca0] transition-all duration-300" 
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>

                                <p className="mt-3 text-right text-[14px] text-[#6b7a99]">
                                    {currentIndex + 1} / {flashcards.length}
                                </p>
                            </div>

                            <div className="mt-6 [perspective:1200px]">
                                <button
                                    type="button"
                                    onClick={handleFlipCard}
                                    className="h-[270px] w-full bg-transparent text-left"
                                >
                                    <div className={`relative h-full w-full rounded-[16px] border border-[#d9dde7] bg-white transition-transform duration-500 [transform-style:preserve-3d] ${
                                            isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
                                        >
                                        
                                        <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-[24px] bg-white px-10 [backface-visibility:hidden]">
                                            <p className="mb-3 text-[12px] font-normal uppercase tracking-[0.10em] text-[#7c89a3]">
                                                Pergunta
                                            </p>

                                            <h2 className="max-w-[720px] text-center font-heading text-[20px] font-semibold text-[#24172b]">
                                                {currentCard.question}
                                            </h2>

                                            <p className="mt-6 text-[12px] text-[#6b7a99]">
                                                Clique para revelar
                                            </p>
                                        </div>

                                        <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-[24px] bg-white px-10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                            <p className="mb-3 text-[12px] font-normal uppercase tracking-[0.10em] text-[#9b4ca0]">
                                                Resposta
                                            </p>

                                            <h2 className="max-w-[760px] text-center text-[18px] font-normal text-[#24172b]">
                                                {currentCard.answer}
                                            </h2>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {isFlipped ? (
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
                                            <div className={`flex h-[40px] items-center justify-center rounded-[12px] text-[14px] font-medium ${
                                                currentResult === "correct"
                                                ? "bg-[#dff0ea] text-[#12b76a]"
                                                : "bg-[#f9e3e6] text-[#ff4d5f]"
                                            }`}>
                                                {currentResult == "correct"
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
                            ) : null}

                            <div className="mt-10 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={handlePreviousCards}
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
                                    disabled={currentIndex == flashcards.length - 1}
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