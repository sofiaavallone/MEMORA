import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, BookOpenText, FileText, Loader2,
  Sparkles, Upload, X, AlertCircle,
} from "lucide-react";
import { SideBar } from "../components/sideBar";
import { LoginModal } from "../components/loginModal";
import { RegisterModal } from "../components/registerModal";
import { DeckCard } from "../components/deckCard";
import { generateDeck, fetchDecks, type DeckAPI } from "../services/deckService";
import { useDueCards } from "../hooks/useDueCards";

type FlashcardOption = 10 | 30 | 50;

// Tipos e tamanho máximo aceitos
const ACCEPTED_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "image/png": "PNG",
  "image/jpeg": "JPG/JPEG",
};
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MIN_TOPIC_LENGTH = 3;
const MAX_TOPIC_LENGTH = 200;

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES[file.type]) {
    const allowed = Object.values(ACCEPTED_TYPES).join(", ");
    return `Tipo de arquivo não suportado. Aceitos: ${allowed}.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `Arquivo muito grande. O limite é ${MAX_FILE_SIZE_MB} MB.`;
  }
  if (file.size === 0) {
    return "O arquivo está vazio.";
  }
  return null;
}

function validateTopic(topic: string): string | null {
  const trimmed = topic.trim();
  if (!trimmed) return "O tópico é obrigatório.";
  if (trimmed.length < MIN_TOPIC_LENGTH)
    return `O tópico deve ter ao menos ${MIN_TOPIC_LENGTH} caracteres.`;
  if (trimmed.length > MAX_TOPIC_LENGTH)
    return `O tópico deve ter no máximo ${MAX_TOPIC_LENGTH} caracteres.`;
  return null;
}

export function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { totalDue } = useDueCards();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const stored = localStorage.getItem("memora_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [topicError, setTopicError] = useState<string | null>(null);
  const [cardsCount, setCardsCount] = useState<FlashcardOption | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Erros de validação por campo
  const [errors, setErrors] = useState({
    topic: "",
    cardsCount: "",
  });

  // Decks recentes
  const [recentDecks, setRecentDecks] = useState<DeckAPI[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(() => !!localStorage.getItem("memora_token"));

  useState(() => {
    const token = localStorage.getItem("memora_token");
    if (!token) return;
    fetchDecks()
      .then((decks) => setRecentDecks(decks.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingDecks(false));
  });

  const handleOpenFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      // Limpa o input para permitir selecionar o mesmo arquivo após corrigir
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    setGenerateError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setTopic("");
    setTopicError(null);
    setCardsCount(null);
    setGenerateError(null);
    setErrors({ topic: "", cardsCount: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTopicChange = (value: string) => {
    setTopic(value);
    // Limpa o erro enquanto o usuário digita
    if (topicError) setTopicError(validateTopic(value));
  };

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async (event) => {
    event.preventDefault();
    setGenerateError(null);

    // Validação local antes de chamar a API
    const tError = validateTopic(topic);
    if (tError) { setTopicError(tError); return; }
    if (!cardsCount) return; // botão já fica desabilitado, só por segurança

    // Valida cada campo e exibe mensagem de erro individual
    const newErrors = {
      topic: !topic.trim() ? "Preencha o tópico do material." : "",
      cardsCount: cardsCount === null ? "Selecione a quantidade de flashcards." : "",
    };

    setErrors(newErrors);

    // Se houver qualquer erro, interrompe o envio
    if (Object.values(newErrors).some((e) => e !== "")) return;

    if (!localStorage.getItem("memora_token")) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsGenerating(true);

    try {
      const deck = await generateDeck({
        topic: topic.trim(),
        quantity: cardsCount,
        sourceName: selectedFile?.name,
      });

      navigate("/flashcards", {
        state: { deckId: deck.id, deckTitle: deck.title },
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
  const topicLength = topic.trim().length;
  const isGenerateDisabled = isGenerating;

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
          }}
        />

        <main className="flex-1 px-8 py-6">
          <section className="mx-auto mt-2 w-full max-w-[835px]">
            <h1 className="font-heading text-[30px] font-bold text-[#24172b]">
              Olá, {user ? user.name : "visitante"} 👋
            </h1>
            <p className="mt-1 text-[16px] font-light text-[#6b7a99]">
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
              <div>
                <button
                  type="button"
                  onClick={handleOpenFilePicker}
                  className={`mt-8 flex min-h-[240px] w-full flex-col items-center justify-center rounded-[16px] border-2 border-dashed bg-white px-5 text-center transition-colors duration-200 ${
                    fileError
                      ? "border-red-400 hover:border-red-400"
                      : "border-[#d9dde7] hover:border-[#c9b4cf]"
                  }`}
                >
                  <div className={`mb-6 flex h-[62px] w-[64px] items-center justify-center rounded-[14px] ${fileError ? "bg-red-50 text-red-400" : "bg-[#f3ebf4] text-[#9b4ca0]"}`}>
                    {fileError ? <AlertCircle size={28} strokeWidth={2.1} /> : <Upload size={28} strokeWidth={2.1} />}
                  </div>
                  <h2 className="font-heading text-[18px] font-semibold text-[#24172b]">
                    Arraste PDFs, slides ou imagens aqui
                  </h2>
                  <p className="mt-1 text-[14px] text-[#6b7a99]">
                    ou clique para selecionar arquivos
                  </p>
                  <p className="mt-2 text-[12px] text-[#aab0bf]">
                    PDF, PPT, PPTX, PNG, JPG · máx. {MAX_FILE_SIZE_MB} MB
                  </p>
                </button>

                {fileError && (
                  <p className="mt-2 flex items-center gap-1.5 text-[13px] text-red-500">
                    <AlertCircle size={14} />
                    {fileError}
                  </p>
                )}
              </div>
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
                        {(selectedFile.size / 1024).toFixed(0)} KB ·{" "}
                        {ACCEPTED_TYPES[selectedFile.type] ?? "Arquivo"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="px-2 text-[#6b7a99] transition-colors hover:text-[#24172b]"
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
                    onChange={(e) => handleTopicChange(e.target.value)}
                    maxLength={MAX_TOPIC_LENGTH}
                    placeholder="Ex: Mitose e Meiose, Direitos Fundamentais..."
                    className={`h-[50px] w-full rounded-[14px] border px-4 text-[15px] text-[#24172b] bg-[#f8f9fb] outline-none placeholder:text-[#7c89a3] focus:border-2 transition-colors ${
                      topicError
                        ? "border-red-400 focus:border-red-400"
                        : "border-[#d9dde7] focus:border-[#9b4ca0]"
                    }`}
                  />
                  <div className="mt-1.5 flex items-center justify-between">
                    {topicError ? (
                      <p className="flex items-center gap-1 text-[12px] text-red-500">
                        <AlertCircle size={12} />
                        {topicError}
                      </p>
                    ) : (
                      <p className="text-[12px] text-[#6b7a99]">
                        Seja específico para melhores resultados.
                      </p>
                    )}
                    <p className={`text-[11px] ${topicLength > MAX_TOPIC_LENGTH * 0.9 ? "text-yellow-600" : "text-[#aab0bf]"}`}>
                      {topicLength}/{MAX_TOPIC_LENGTH}
                    </p>
                  </div>
                    onChange={(e) => {
                      setTopic(e.target.value);
                      // Limpa o erro ao começar a digitar
                      if (errors.topic) setErrors((prev) => ({ ...prev, topic: "" }));
                    }}
                    placeholder="Ex: Mitose e Meiose, Direitos Fundamentais, Farmacocinética..."
                    className={`h-[50px] w-full rounded-[14px] border px-4 text-[15px] text-[#24172b] bg-[#f8f9fb] outline-none placeholder:text-[#7c89a3] focus:border-2 ${
                      errors.topic
                        ? "border-[#ff4d5f] focus:border-[#ff4d5f]"
                        : "border-[#d9dde7] focus:border-[#9b4ca0]"
                    }`}
                  />
                  {/* Mensagem de erro do tópico */}
                  {errors.topic ? (
                    <p className="mt-1 text-[12px] text-[#ff4d5f]">{errors.topic}</p>
                  ) : (
                    <p className="mt-2 text-[12px] text-[#6b7a99]">
                      Especifique o tópico para gerar conteúdo mais focado e relevante.
                    </p>
                  )}
                </div>

                {/* Quantidade */}
                <div className="mt-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles size={16} strokeWidth={2} className="text-[#9b4ca0]" />
                    <p className="font-heading text-[14px] font-medium text-[#24172b]">
                      Quantos flashcards deseja gerar?
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {([10, 30, 50] as FlashcardOption[]).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setCardsCount(option);
                          // Limpa o erro ao selecionar
                          if (errors.cardsCount) setErrors((prev) => ({ ...prev, cardsCount: "" }));
                        }}
                        className={`h-[42px] rounded-[12px] border text-[15px] font-medium transition-colors duration-200 ${
                          cardsCount === option
                            ? "border-[#9b4ca0] bg-[#f3ebf4] text-[#9b4ca0]"
                            : errors.cardsCount
                            ? "border-[#ff4d5f] bg-[#f8f9fb] text-[#6b7a99] hover:border-[#ff4d5f]"
                            : "border-[#d9dde7] bg-[#f8f9fb] text-[#6b7a99] hover:border-[#cbb8d0]"
                        }`}
                      >
                        {option} cards
                      </button>
                    ))}
                  </div>
                  {cardsCount === null && isGenerating === false && topic.trim().length > 0 && (
                    <p className="mt-2 text-[12px] text-[#aab0bf]">
                      Selecione a quantidade de flashcards.
                    </p>
                  {/* Mensagem de erro da quantidade */}
                  {errors.cardsCount && (
                    <p className="mt-2 text-[12px] text-[#ff4d5f]">{errors.cardsCount}</p>
                  )}
                </div>

                {/* Erro de geração */}
                {generateError && (
                  <div className="mt-4 flex items-start gap-2 rounded-[10px] bg-red-50 px-4 py-3">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                    <p className="text-[13px] text-red-500">{generateError}</p>
                  </div>
                )}

                {/* Submit */}
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
                  <Loader2 size={16} className="animate-spin" /> Carregando...
                </div>
              )}
              {!loadingDecks && recentDecks.length === 0 && (
                <p className="mt-4 text-[14px] text-[#6b7a99]">
                  {user ? "Nenhum deck criado ainda. Gere o primeiro acima!" : "Faça login para ver seus decks recentes."}
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
                        navigate("/flashcards", { state: { deckId: deck.id, deckTitle: deck.title } })
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
        onLoginSucess={(u) => setUser(u)}
        onCreateAccountClick={() => { setIsLoginModalOpen(false); setIsRegisterModalOpen(true); }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={(u) => setUser(u)}
        onLoginClick={() => { setIsRegisterModalOpen(false); setIsLoginModalOpen(true); }}
      />
    </div>
  );
}
