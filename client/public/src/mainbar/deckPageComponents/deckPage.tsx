//props recebidas:
//
//prop.identifier = identificador que permite reconhecer o deck
//
//prop.array = array com todos os decks
//
//prop.set_decks = função de setar o array de decks
//                 essa função e avariável anterior estão
//                 sendo usadas por motivos de rerenderização
//

import { useState } from 'react'
import { Deck } from "../../app/App.tsx"
import NavBar from "./navBar.tsx"
import NavDisplay from "./navDisplay.tsx"

type deckpage = {
    identifier: number
    array: Array<Deck>
    set_decks: Function
}

function DeckPage(prop: deckpage) {
    const [navState, setDisplay] = useState<string>("Flashcards") //permite a navegação dentro da deckpage
    
    //definição do deck que será usado a partir do identificador
    //prop.identifier pode ser alterado dependendo de como for feita a conexão entre a deckpage e o deckcard
    //nessa implementação é o index do deck

    const deck: Deck = prop.array[prop.identifier]

    return (
        <div className="flex flex-col w-full h-full animate-in fade-in duration-300">
            {/* Cabeçalho do Deck */}
            <div className="mb-6">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{deck.título}</h1>
                <p className="text-slate-500 mt-2 text-lg">Geral</p>{/* Placeholder para a categoria, caso adicione ao objeto Deck depois */}
            </div>

            {/* Abas de Navegação (Flashcards, Resumos, etc) */}
            <NavBar deck={deck} nav_state={navState} nav_change={setDisplay} />

            {/* Área de exibição do conteúdo */}
            <div className="mt-6 flex-1 w-full flex flex-col">
                <NavDisplay 
                    nav_state={navState}
                    identifier={prop.identifier}//o identificador é passado para ser usado na atualização do deck
                    array={prop.array}
                    set_decks={prop.set_decks}
                />
            </div>
        </div>
    )
}

export default DeckPage