import {Deck} from "../app/App.tsx"
import './header.css'

type header = {
  nome:string
  state: string
  decks: Array<Deck>
}

function Header(prop: header) {
  let n_decks:number = prop.decks.length
  let n_flashcards:number = 0;
  for (let i of prop.decks){
    n_flashcards+=i.flashcards.length
  }
  if (prop.state === "upload") {
    return (
      <div id="header">
        <h1>Olá, <span className="user-name">{prop.nome}</span></h1>
        <p>bem vinda(o) de volta!</p>
      </div>
    )
  } 
  
  if (prop.state === "decks") {
    return (
      <div id="header">
        <h1>Escolha um deck para revisar!</h1>
        <p>{n_decks} decks · {n_flashcards} cards</p>
      </div>
    )
  }

  return null; 
}

export default Header