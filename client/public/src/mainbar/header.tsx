//props recebidas:
//
//prop.nome: nome do usuário que será mostrado na tela
//
//prop.state: estado da tela
//            usado para mudar o header dependendo de ester em upload ou meus decks
//
//prop.decks: array dos decks do usuário
//            usado para o subtítulo do header em meus decks
//

import { Deck } from "../app/App.tsx"

type header = {
  nome: string
  state: string
  decks: Array<Deck>
}

function Header(prop: header) {
  const n_decks: number = prop.decks.length
  
  const n_flashcards: number = prop.decks.reduce((acc, deck) => acc + deck.flashcards.length, 0);

  if (prop.state === "upload") {
    return (
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Olá, <span>{prop.nome}</span> 👋
        </h1>
        <p className="text-slate-600 mt-2 text-lg">bem vinda(o) de volta!</p>
      </header>
    )
  } 
  
  if (prop.state === "decks") {
    return (
      <header className="mb-8 flex justify-between items-end w-full">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Escolha um deck para revisar!</h1>
          <p className="text-slate-600 mt-2 text-lg">{n_decks} decks · {n_flashcards} cards</p>
        </div>
      </header>
    )
  }

  return null; 
}

export default Header