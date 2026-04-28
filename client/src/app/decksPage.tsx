import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Loader2 } from "lucide-react";
import { DeckCard } from "../components/deckCard";
import { SideBar } from "../components/sideBar";
import { LoginModal } from "../components/loginModal";
import { RegisterModal } from "../components/registerModal";
import { fetchDecks, type DeckAPI } from "../services/deckService";
import { useDueCards } from "../hooks/useDueCards";

export function DecksPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [decks, setDecks] = useState<DeckAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { totalDue } = useDueCards();

  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const storedUser = localStorage.getItem("memora_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const token = localStorage.getItem("memora_token");
    if (!token) { setLoading(false); return; }

    fetchDecks()
      .then(setDecks)
      .catch(() => setError("Não foi possível carregar os decks."))
      .finally(() => setLoading(false));
  }, []);

  const filteredDecks = useMemo(
    () => decks.filter((d) => d.title.toLowerCase().includes(search.toLowerCase().trim())),
    [search, decks]
  );

  const totalCards = filteredDecks.reduce((acc, d) => acc + d.cardCount, 0);

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="flex">
        <SideBar
          reviewCardsCount={totalDue}
          reviewProgressPercentage={totalDue === 0 ? 100 : 0}
          activeItem="decks"
          onLoginClick={() => setIsLoginModalOpen(true)}
          user={user}
          onLogout={() => {
            localStorage.removeItem("memora_token");
            localStorage.removeItem("memora_user");
            setUser(null);
            navigate("/");
          }}
        />

        <main className="flex-1 px-10 py-8">
          <section className="mx-auto w-full max-w-[950px]">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-heading text-[24px] font-semibold text-[#24172b]">
                  Meus Decks
                </h1>
                <p className="mt-1 text-[14px] text-[#6b7a99]">
                  {filteredDecks.length} decks · {totalCards} cards
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-4 flex items-center gap-2 rounded-[12px] bg-[#9b4ca0] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#b15bb4]"
              >
                <Plus size={16} /> Novo Deck
              </button>
            </div>

            <div className="relative mt-6">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c89a3]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar decks..."
                className="h-[42px] w-full rounded-[12px] border border-[#d9dde7] bg-white pl-11 pr-4 text-[14px] text-[#24172b] outline-none placeholder:text-[#7c89a3] focus:ring-2 focus:ring-[#9b4ca0]/20"
              />
            </div>

            {loading && (
              <div className="mt-20 flex flex-col items-center gap-3 text-[#6b7a99]">
                <Loader2 size={28} className="animate-spin" />
                <p className="text-[14px]">Carregando decks...</p>
              </div>
            )}
            {!loading && error && (
              <div className="mt-20 text-center text-[14px] text-[#ff4d5f]">{error}</div>
            )}
            {!loading && !error && !user && (
              <div className="mt-20 text-center text-[14px] text-[#6b7a99]">
                Faça{" "}
                <button type="button" onClick={() => setIsLoginModalOpen(true)} className="text-[#9b4ca0] underline">
                  login
                </button>{" "}
                para ver seus decks.
              </div>
            )}
            {!loading && !error && user && filteredDecks.length === 0 && (
              <div className="mt-20 text-center text-[14px] text-[#6b7a99]">
                {search ? "Nenhum deck encontrado." : "Você ainda não tem decks. Crie um novo!"}
              </div>
            )}
            {!loading && !error && filteredDecks.length > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-5">
                {filteredDecks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    title={deck.title}
                    cardsCount={deck.cardCount}
                    masteredPercentage={Math.round(deck.accuracy * 100)}
                    onClick={() => navigate("/flashcards", { state: { deckId: deck.id, deckTitle: deck.title } })}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}
        onCreateAccountClick={() => { setIsLoginModalOpen(false); setIsRegisterModalOpen(true); }} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={() => { setIsRegisterModalOpen(false); setIsLoginModalOpen(true); }} />
    </div>
  );
}