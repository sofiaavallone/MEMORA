//props recebidas:
//
//props.nav_state: variável que define o estado atual da navegação
//                 usada para saber qual página do deck renderizar
//
//prop.index: index do objeto deck que está sendo utilizado
//
//prop.array: array de todos os decks
//
//prop.set_decks: função para setar o array de decks
//

import {Deck} from "../../app/App.tsx"
import FlashcardDisplay from "./flashcardDisplay.tsx"

type navdisplay = {
  nav_state:string
  index:number
  array:Array<Deck>
  set_decks:Function//talvez mude depois? parece não ser recomendado
}

function NavDisplay(prop:navdisplay){
  if (prop.nav_state=="deck")
    return(<>
             <FlashcardDisplay index={prop.index}
                               array={prop.array}
                               set_decks={prop.set_decks}/>
           </>)
  else if (prop.nav_state=="resumo"){
    return(<div>
            aba de resumo
           </div>)
  }
  else if (prop.nav_state=="questões"){
    return(<div>
              aba de questões
           </div>)
  }
}
export default NavDisplay