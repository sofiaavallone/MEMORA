import './header.css'

type header = {
  state: string
}

function Header(prop: header) {
  const usuario = "Clarisse"

  if (prop.state === "upload") {
    return (
      <div id="header">
        <h1>Olá, <span className="user-name">{usuario}</span></h1>
        <p>bem vinda de volta!</p>
      </div>
    )
  } 
  
  if (prop.state === "decks") {
    return (
      <div id="header">
        <h1>Escolha um deck para revisar!</h1>
        <p>6 decks : 273 cards</p>
      </div>
    )
  }

  return null; 
}

export default Header