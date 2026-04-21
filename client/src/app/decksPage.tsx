import { DeckCard } from "../components/deckCard";
import { SideBar } from "../components/sideBar";

export function DecksPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="flex">
        <SideBar
          reviewCardsCount={12}
          reviewProgressPercentage={70}
          activeItem="decks"
          onLoginClick={() => console.log("Entrar clicado")}
        />

        <main className="flex-1 p-8">
          <h1 className="mb-6 text-3xl font-semibold text-[#24172b]">
            Meus Decks
          </h1>

          <DeckCard
            title="Biologia Celular"
            cardsCount={42}
            masteredPercentage={60}
            onClick={() => console.log("Deck clicado")}
          />
        </main>
      </div>
    </div>
  );
}