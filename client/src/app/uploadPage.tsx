import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpenText, FileText, Loader2, Sparkles, Upload, X } from "lucide-react";
import { SideBar } from "../components/sideBar";
import { LoginModal } from "../components/loginModal";
import { RegisterModal } from "../components/registerModal";
import { DeckCard } from "../components/deckCard";
import { generateDeck, fetchDecks, type DeckAPI } from "../services/deckService";
import { useDueCards } from "../hooks/useDueCards";

type FlashcardOption = 10 | 30 | 50;

export function UploadPage() {
  const navigate = useNavigate();
  const { totalDue } = useDueCards();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const storedUser = localStorage.getItem("memora_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [topic, setTopic] = useState<string>("");
  const [cardsCount, setCardsCount] = useState<FlashcardOption | null>(null);

  // Estado de geração
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Decks recentes
  const [recentDecks, setRecentDecks] = useState<DeckAPI[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(() => {
    return !!localStorage.getItem("memora_token");
  });

  // Carrega decks recentes ao montar (se logado)
  useState(() => {
    const token = localStorage.getItem("memora_token");
    if (!token) return;

    fetchDecks()
      .then((decks) => setRecentDecks(decks.slice(0, 3)))
      .catch(() => {}) // silencioso — seção secundária
      .finally(() => setLoadingDecks(false));
  });

  const handleOpenFilePicker = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setGenerateError(null);
  };

  const handleRemoveFile = (): void => {
    setSelectedFile(null);
    setTopic("");
    setCardsCount(null);
    setGenerateError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async (event) => {
    event.preventDefault();
    if (!topic.trim() || !cardsCount) return;

    // Verifica se está logado
    if (!localStorage.getItem("memora_token")) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const deck = await generateDeck({
        topic: topic.trim(),
        quantity: cardsCount,
        sourceName: selectedFile?.name,
      });

      // Redireciona para a página de flashcards do deck gerado
      navigate("/flashcards", {
        state: {
          deckId: deck.id,
          deckTitle: deck.title,
        },
      });
    } catch (error) {
      setGenerateError(
        error instanceof Error ? error.message : "Erro ao gerar flashcards. Tente novamente."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const isGenerateDisabled = !topic.trim() || cardsCount === null || isGenerating;

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="flex">
        <SideBar
          reviewCardsCount={totalDue}
          reviewProgressPercentage={totalDue === 0 ? 100 : 0}
          activeItem="upload"
          onLoginClick={() => setIsLoginModalOpen(true)}
          user={user}
          onLogout={() => {
            localStorage.removeItem("memora_token");
            localStorage.removeItem("memora_user");
            setUser(null);
            navigate("/");
          }}
        />

        <main className="flex-1 px-8 py-6">
          <section className="mx-auto w-full max-w-[835px] mt-2">
            <h1 className="font-heading text-[30px] font-bold text-[#24172b]">
              Olá, {user ? user.name : "visitante"} 👋
            </h1>
            <p className="mt-1 font-light text-[16px] text-[#6b7a99]">
              Envie seus materiais e gere flashcards com IA em segundos.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.ppt,.pptx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileChange}
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={handleOpenFilePicker}
                className="mt-8 flex min-h-[240px] w-full flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-[#d9dde7] bg-white px-5 text-center transition-colors duration-200 hover:border-[#c9b4cf]"
              >
                <div className="mb-6 flex h-[62px] w-[64px] items-center justify-center rounded-[14px] bg-[#f3ebf4] text-[#9b4ca0]">
                  <Upload size={28} strokeWidth={2.1} />
                </div>
                <h2 className="font-heading text-[18px] font-semibold text-[#24172b]">
                  Arraste PDFs, slides ou imagens aqui
                </h2>
                <p className="mt-1 text-[14px] text-[#6b7a99]">
                  ou clique para selecionar arquivos
                </p>
              </button>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 rounded-[16px] border border-[#d9dde7] bg-white px-8 py-8"
              >
                {/* Arquivo selecionado */}
                <div className="rounded-[12px] bg-[#f3ebf4] px-3 py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#eadcec] text-[#9b4ca0]">
                      <FileText size={20} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-[#24172b]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[12px] text-[#6b7a99]">
                        {Math.round(selectedFile.size / 1024)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-[#6b7a99] transition-colors duration-200 hover:text-[#24172b] px-2"
                      aria-label="Remover arquivo"
                    >
                      <X size={18} strokeWidth={2.1} />
                    </button>
                  </div>
                </div>

                {/* Tópico */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center gap-2 text-[#9b4ca0]">
                    <BookOpenText size={16} strokeWidth={2} />
                    <label
                      htmlFor="topic"
                      className="font-heading text-[14px] font-medium text-[#24172b]"
                    >
                      Qual tópico do material você quer estudar?
                    </label>
                  </div>
                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: Mitose e Meiose, Direitos Fundamentais, Farmacocinética..."
                    className="h-[50px] w-full rounded-[14px] border border-[#d9dde7] px-4 text-[15px] text-[#24172b] bg-[#f8f9fb] outline-none placeholder:text-[#7c89a3] focus:border-[#9b4ca0] focus:border-2"
                  />
                  <p className="mt-2 text-[12px] text-[#6b7a99]">
                    Especifique o tópico para gerar conteúdo mais focado e relevante.
                  </p>
                </div>

                {/* Quantidade */}
                <div className="mt-4">
                  <div className="mb-3 flex items-center gap-2 text-[#9b4ca0]">
                    <Sparkles size={16} strokeWidth={2} />
                    <p className="font-heading text-[14px] font-medium text-[#24172b]">
                      Quantos flashcards deseja gerar?
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {([10, 30, 50] as FlashcardOption[]).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setCardsCount(option)}
                        className={`h-[42px] rounded-[12px] border text-[15px] font-medium transition-colors duration-200 ${
                          cardsCount === option
                            ? "border-[#9b4ca0] bg-[#f3ebf4] text-[#9b4ca0]"
                            : "border-[#d9dde7] bg-[#f8f9fb] text-[#6b7a99] hover:border-[#cbb8d0]"
                        }`}
                      >
                        {option} cards
                      </button>
                    ))}
                  </div>
                </div>

                {/* Erro de geração */}
                {generateError && (
                  <p className="mt-4 text-[13px] text-[#ff4d5f]">{generateError}</p>
                )}

                {/* Botão de submit */}
                <button
                  type="submit"
                  disabled={isGenerateDisabled}
                  className={`mt-6 flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] text-[14px] font-medium text-white transition-colors duration-200 ${
                    isGenerateDisabled
                      ? "cursor-not-allowed bg-[#d7bfd8]"
                      : "bg-[#9b4ca0] hover:bg-[#9b4ca0]/80"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Gerando flashcards...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} strokeWidth={2} />
                      <span>Gerar Flashcards com IA</span>
                      <ArrowRight size={16} strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Decks recentes */}
            <section className="mt-10">
              <h2 className="font-heading text-[20px] font-semibold text-[#24172b]">
                Decks Recentes
              </h2>

              {loadingDecks && (
                <div className="mt-4 flex items-center gap-2 text-[14px] text-[#6b7a99]">
                  <Loader2 size={16} className="animate-spin" />
                  Carregando...
                </div>
              )}

              {!loadingDecks && recentDecks.length === 0 && (
                <p className="mt-4 text-[14px] text-[#6b7a99]">
                  {user
                    ? "Nenhum deck criado ainda. Gere o primeiro acima!"
                    : "Faça login para ver seus decks recentes."}
                </p>
              )}

              {!loadingDecks && recentDecks.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {recentDecks.map((deck) => (
                    <DeckCard
                      key={deck.id}
                      title={deck.title}
                      cardsCount={deck.cardCount}
                      masteredPercentage={Math.round(deck.accuracy * 100)}
                      onClick={() =>
                        navigate("/flashcards", {
                          state: { deckId: deck.id, deckTitle: deck.title },
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          </section>
        </main>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSucess={(loggedUser) => setUser(loggedUser)}
        onCreateAccountClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={(createdUser) => setUser(createdUser)}
        onLoginClick={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
}