import './SideButton.css' 

type sidebutton = {
  text: string
  change: Function
  target: string
  state: string
}

function SideButton(prop: sidebutton) {
  function goto() {
    prop.change(prop.target)
  }

  const estaAtivo = prop.state === prop.target;

  return (
    <button 
      onClick={goto} 
      className={`side-button ${estaAtivo ? 'active' : ''}`}
    >
      {prop.text}
    </button>
  )
}

export default SideButton