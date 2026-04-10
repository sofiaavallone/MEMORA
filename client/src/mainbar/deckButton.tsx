import './DeckButton.css'
import { Deck } from "../app/App.tsx"

type deckbutton = {
    index: number
    my_deck: Deck
    change: (page: string) => void // Dica de DS: tipagem mais precisa
    def_current_deck: (index: number) => void
}

function DeckButton(prop: deckbutton) {
    function goto() {
        prop.def_current_deck(prop.index) // Primeiro definimos o deck
        prop.change("deckpage")           // Depois mudamos a página
    }

    // Cálculo simples para a barrinha de progresso
    const total = prop.my_deck.flashcards.length;
    const acertos = prop.my_deck.taxa_de_acerto;
    const porcentagem = total > 0 ? (acertos / total) * 100 : 0;

    return (
        <button className="deck-card" onClick={goto}>
            <h3>{prop.my_deck.título}</h3>
            
            <div className="deck-stats">
                <span>Taxa de acerto hoje: <strong>{acertos}/{total}</strong></span>
                <div className="progress-bar-bg">
                    <div 
                        className="progress-bar-fill" 
                        style={{ width: `${porcentagem}%` }}
                    ></div>
                </div>
            </div>
        </button>
    )
}

export default DeckButton