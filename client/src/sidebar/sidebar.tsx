//props recebidas:
//
//prop.state: variável que representa o estado atual da página
//            importante para informar aos botões se eles devem aparecer ativos ou não
//prop.change: função de mudança do estado de página atual,
//             usada para permitir a navegação entre páginas

import {Deck} from "../app/App.tsx"
import Logo from "./logo.tsx"
import SideButton from "./sideButton.tsx"
import LoginButton from "./loginButton.tsx"
import Widget from "./widget.tsx"

type sidebar = {
    state:string
    change:Function
    array:Array<Deck>
}

function Sidebar(prop:sidebar){
    return(
        <div id="sidebar">
          {/*símbolo de logo, botões de navegação e botão de login*/}
          <Logo/>
          <SideButton text="upload" target="upload" change={prop.change}  state={prop.state}/>
          <SideButton text="decks" target="decks" change={prop.change}  state={prop.state}/>
          <Widget array={prop.array}/>
          <LoginButton/>
        </div>
    );
}
export default Sidebar