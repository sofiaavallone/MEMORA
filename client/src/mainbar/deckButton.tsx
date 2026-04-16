//props recebidas:
//
//prop.index: index do deck a que o botão se refere
//            usado para dizer a aba deckpage qual deck mostrar e alterar
//
//prop.my_deck: o objeto deck que está sendo utilizado
//
//prop.change: função para mudar de página uma vez que o botão for apertado
//
//prop.def_current_deck: define o deck que está sendo visto atualmente
//                       usado junto com o index para comunicação com deckpage

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
            <p>{prop.my_deck.flashcards.length} cards</p>
            <h3>{prop.my_deck.título}</h3>
            
            <div className="deck-stats">
                <div className="progress-bar-bg">
                    <div 
                        className="progress-bar-fill" 
                        style={{ width: `${porcentagem}%` }}
                        ></div>
                </div>
                <span><strong>{Number((acertos/total).toFixed(2))*100}%</strong></span>
            </div>
        </button>
    )
}

export default DeckButton