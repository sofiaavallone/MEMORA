//props recebidas:
//
//props.nav_state: variável que define o estado atual da navegação
//                usada para saber qual página do deck renderizar
//
//prop.identifier: identificador do deck que será usado
//
//prop.array: array de todos os decks
//
//prop.set_decks: função para setar o array de decks
//

import { Deck } from "../../app/App.tsx"
import FlashcardDisplay from "./flashcardDisplay.tsx"

type navdisplay = {
    nav_state: string
    identifier: number
    array: Array<Deck>
    set_decks: Function
}

function NavDisplay(prop: navdisplay) {
    if (prop.nav_state == "Flashcards") {
        return (
            <>
            <div className="flex-1 w-full h-full">
                <FlashcardDisplay 
                    identifier={prop.identifier}
                    array={prop.array}
                    set_decks={prop.set_decks} 
                />
            </div>
            </>
        )
    }
    else if (prop.nav_state == "resumo") {
        return (
            <div className="flex-1 w-full min-h-[400px] flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl mt-4">
                <p className="text-slate-400 text-lg font-medium">aba de resumo (em construção)</p>
            </div>
        )
    }
    else if (prop.nav_state == "questões") {
        return (
            <div className="flex-1 w-full min-h-[400px] flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl mt-4">
                <p className="text-slate-400 text-lg font-medium">aba de questões (em construção)</p>
            </div>
        )
    }
    
    return null;
}

export default NavDisplay