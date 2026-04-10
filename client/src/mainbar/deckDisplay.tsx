//props recebidas:
//
//prop.state = estado da página, será usado para definir o return:
//             - mostrar os decks mais recentes (página de upload)
//             - todos os decks (página de decks)
//             (ainda não foi implementado)
//
//prop.change = função para definir o estado da página
//              usado para entrar no deck
//
//prop.array = array contendo todos os decks
//             necessário para criar cada botão ligado para um deck
//
//def_current_deck = função que define o deck atual
//                   usado para que se saiba em qual deck entrar
//

import {Deck} from "../app/App.tsx"
import DeckButton from "./deckButton.tsx"

type deckdisplay = {
  state:string
  change:Function//talvez seja alterado? parece não ser recomendado
  array:Array<Deck>
  def_current_deck:Function
}

function DeckDisplay(prop:deckdisplay){
  
  //função para criar um array de componentes DeckButton
  function makeButtons(){
    let outArray:Array<React.ReactNode> = []//array temporário para output
    for (let i=0; i<prop.array.length; i = i+1){
      //adiciona um novo botão que corresponde ao deck daquele index
      outArray.push(
        <DeckButton key={i}//a chave não é utilizada, é apenas uma ajuda para o react renderizar o componente
                    index={i}
                    my_deck={prop.array[i]}
                    change={prop.change}
                    def_current_deck={prop.def_current_deck}/>
      )
    }
    return (outArray)
  }

  let buttons:Array<React.ReactNode> = makeButtons()

  return(
    <div id="deck_display">
      {buttons}
    </div>
  )
}
export default DeckDisplay