//props recebidas:
//
//prop.index = index do objeto deck que está sendo utilizado
//
//prop.array = array com todos os decks
//
//prop.set_decks = função de setar o array de decks
//                 essa função e avariável anterior estão
//                 sendo usadas por motivos de rerenderização
//

import { useState } from 'react'
import {Deck} from "../../app/App.tsx"
import NavBar from "./navBar.tsx"
import NavDisplay from "./navDisplay.tsx"

type deckpage = {
    index:number
    array:Array<Deck>
    set_decks:Function//talvez mude depois? parece não ser recomendado
}

function DeckPage(prop:deckpage){
    const[navState, setDisplay]=useState<string>("deck")

    const deck:Deck = prop.array[prop.index]

    return(<div>
             <h1>Deck atual: {deck.título}</h1>
             <NavBar nav_state={navState} nav_change={setDisplay}/>
             <NavDisplay nav_state={navState}
                         index={prop.index}
                         array={prop.array}
                         set_decks={prop.set_decks}
                         />
           </div>)
}
export default DeckPage