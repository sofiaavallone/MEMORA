//props recebidas:
//
//prop.nome: nome do usuário que será mostrado no header
//
//prop.state: variável que contém a página atual
//prop.change: função que altera a página atual,
//             usada para navegação do site
//
//prop.array: array contendo todos os decks
//
//prop.set_decks: função que seta o array de decks
//
//prop.current_deck: variável que diz o index do deck que está sendo usado,
//                   importante para permitir que os botões de deck entrem no deck certo
//
//prop.def_current_deck: função que altera a variável de deck atual
//

import {useState} from 'react'
import {Deck} from "../app/App.tsx"
import Header from "./header.tsx"
import UploadBox from "./uploadBox.tsx"
import SearchTab from "./searchTab.tsx"
import DeckDisplay from "./deckDisplay.tsx"
import DeckPage from "./deckPageComponents/deckPage.tsx"

type mainbar = {
  nome:string
  state:string
  change:Function//talvez seja alterado? parece não ser recomendado
  array:Array<Deck>
  set_decks:Function
  current_deck:number
  def_current_deck:Function
}

function Mainbar(prop:mainbar){

  const [previousState, setPrevious] = useState<string>("upload")
  const [searchFilter, setFilter] = useState<string>("")

  //caso esteja saindo de aba de decks reseta o filtro da barra de busca
  if (prop.state!=previousState){//houve uma mudança de página
    if (previousState=="decks"){//checa se essa mudança de página foi da área decks
      setFilter("")
    }
    setPrevious(prop.state)//muda a página considerada anterior independetemente do segundo if
                           //dessa forma qualquer renderização feita dentro da página não ativa o if
                           //pois previousState e prop.state (estado atual) são iguais
  }

  //ifs para decidir o return

  if (prop.state=="upload"){ //              estado de upload
    return(
      <div className="mainbar">
        <Header nome={prop.nome}
                state={prop.state}
                decks={prop.array}/>
        <div className="centering_div">{/*div para estilização*/}
          <UploadBox set_decks={prop.set_decks}
                     decks={prop.array}//caixa onde se dá o upload do pdf, e o fetch do endpoint
          />
          <h1 id="titulo_decks_recentes">Decks recentes</h1>

          {/*faz o display dos botões */}
          <DeckDisplay  state={prop.state} //variável que diz o estdo atual
                        change={prop.change}//função para mudar a página atual
                        array={prop.array}//lista de todos os decks
                        def_current_deck={prop.def_current_deck}//função para definir o deck atual
                        filter={searchFilter}/>
        </div>
      </div>
    )
  }



  else if (prop.state=="decks"){//           estado de decks
    return(
      <div className="mainbar">
        <Header nome={prop.nome}
                state={prop.state}
                decks={prop.array}/>
        <div className="centering_div">
          {/* precisará de uma prop com estado compartilhado para fazer a busca */}
          <SearchTab setFilter={setFilter}/>
          <DeckDisplay  state={prop.state}//varável que contém a página atual
                        change={prop.change}//função para definir a página atual
                        array={prop.array}//array com todos os decks
                        def_current_deck={prop.def_current_deck}//função para definir o deck atual
                        filter={searchFilter}/>
        </div>
      </div>
    )
  }



  else if (prop.state=="deckpage"){//          estado de revisão de deck
    return(<div>
            {/*essa página está separada por propósitos de legibilidade do código*/}
            <DeckPage index={prop.current_deck}//recebe o objeto deck que está sendo utilizado
                      array={prop.array}
                      set_decks={prop.set_decks}
            />

            {/*AVISO: o deck que está sendo passado É SIM MUTÁVEL
              qualquer alteração feita nesse objeto OU em uma variável que o contenha IRÁ ALTERAR O ORIGINAL
              LEMBRAR DISSO DURANTE O CÓDIGO*/}
            {/*POSSÍVEL SOLUÇÃO: criação de funções de copia para cada classe*/}

          </div>)
  }
}
export default Mainbar