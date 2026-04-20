import { DeckCard } from "./components/deckCard";

function App() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] p-8">
      <DeckCard
        title="Biologia Celular"
        cardsCount={42}
        masteredPercentage={90}
        onClick={() => console.log("Deck clicado")}
      />
    </div>
  );
}

export default App;