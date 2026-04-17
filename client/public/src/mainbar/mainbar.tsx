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
//prop.identifier: variável identifica o deck que está sendo usado (no caso dessa implementação o index)
//                 usado para permitir que os botões de deck entrem no deck desejado
//
//prop.def_identifier: função que altera a variável de deck atual
//                     usado para dizer a deckpage qual deck mostrar
//

import { useState, useEffect } from 'react'
import { Deck } from "../app/App.tsx"
import Header from "./header.tsx"
import UploadBox from "./uploadBox.tsx"
import DeckPage from "./deckPageComponents/deckPage.tsx"

type mainbar = {
  nome: string
  state: string
  change: Function
  array: Array<Deck>
  set_decks: Function
  identifier: number
  def_identifier: Function
}

function Mainbar(prop: mainbar) {

  const [previousState, setPrevious] = useState<string>("upload") //usado para resetar a string de filtro sempre que se sai de meus decks
  const [searchFilter, setFilter] = useState<string>("")//variável que contém a string que está sendo buscada
  
  // função para definir qual o filtro de nome dos decks
  function search(event: React.ChangeEvent<HTMLInputElement>) {
    setFilter(String(event.target.value))
  }

  // função para resetar o filtro quando sair de meus decks
  // Correção React: Efeitos colaterais (mudanças de estado baseadas em props) 
  // devem ficar dentro do useEffect para evitar erros de renderização.
  useEffect(() => {
    if (prop.state !== previousState) {
      if (previousState === "decks") {
        setFilter("")
      }
      setPrevious(prop.state)
    }
  }, [prop.state, previousState])

  // Classes de layout reutilizadas para manter o padrão em todas as páginas
  const mainbarClass = "flex flex-1 justify-center h-screen w-full overflow-y-auto bg-slate-50 p-8 md:p-12" //adicionei "flex" e "justify-center" porque no computador do cin tava ficando tudo pro lado
  const containerClass = "max-w-5xl mx-auto w-full"

  if (prop.state === "upload") {
    return (
      <main className={mainbarClass}>
        <div className={containerClass}>
          <Header nome={prop.nome}
                  state={prop.state}
                  decks={prop.array} />
                  
          <UploadBox set_decks={prop.set_decks}
                     decks={prop.array} />
                     
          <h2 className="text-xl font-bold text-slate-900 mt-12 mb-6">Decks recentes</h2>
        </div>
      </main>
    )
  }

  else if (prop.state === "decks") {
    return (
      <main className={mainbarClass}>
        <div className={containerClass}>
          <Header nome={prop.nome}
                  state={prop.state}
                  decks={prop.array} />
                  
          <div className="mb-8">
            <div className="relative w-full">
              {/* Ícone de lupa absoluto dentro do container */}
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>

              <input 
                type="text" 
                onChange={search}
                placeholder="Buscar decks..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 focus:border-transparent transition-shadow"
              />
            </div>
          </div>
        </div>
      </main>
    )
  }

  else if (prop.state === "deckpage") {
    return (
      <main className={mainbarClass}>
        <div className={containerClass}>
          {/*essa página está separada por propósitos de legibilidade do código*/}
          <DeckPage identifier={prop.identifier}
                    array={prop.array}
                    set_decks={prop.set_decks} />

          {/*AVISO: o deck que está sendo passado É SIM MUTÁVEL
             qualquer alteração feita nesse objeto OU em uma variável que o contenha IRÁ ALTERAR O ORIGINAL
             LEMBRAR DISSO DURANTE O CÓDIGO*/}
          {/*POSSÍVEL SOLUÇÃO: criação de funções de copia para cada classe*/}
        </div>
      </main>
    )
  }
  
  return null;
}

export default Mainbar