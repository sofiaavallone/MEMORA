//props recebidas:
//
//prop.state: variável que representa o estado atual da página
//            importante para informar aos botões se eles devem aparecer ativos ou não
//prop.change: função de mudança do estado de página atual,
//             usada para permitir a navegação entre páginas

import {User,Deck,Flashcard} from "../app/App.tsx"
import Logo from "./logo.tsx"
import SideButton from "./sideButton.tsx"
import LoginButton from "./loginButton.tsx"
import Widget from "./widget.tsx"

type sidebar = {
    user:User
    set_user:Function
    state:string
    change:Function
}

function Sidebar(prop:sidebar){
    function testFunc(){
        let tempArray:Array<Deck> = [...prop.user.decks]
        tempArray.push(
            new Deck(
                "teste",
                [new Flashcard("frente1", "verso1"),
                 new Flashcard("frente2", "verso2"),
                 new Flashcard("frente3", "verso3"),
                 new Flashcard("frente4", "verso4"),
                 new Flashcard("frente5", "verso5")
                ]
            )
        )
        prop.set_user(
            new User(
                prop.user.nome,
                tempArray
            )
        )
    }
    return(
        <div id="sidebar">
          {/*símbolo de logo, botões de navegação e botão de login*/}
          <Logo/>
          <SideButton text="upload" target="upload" change={prop.change}  state={prop.state}/>
          <SideButton text="decks" target="decks" change={prop.change}  state={prop.state}/>
          <Widget array={prop.user.decks}/>
          <button onClick={testFunc}></button>
          <LoginButton/>
        </div>
    );
}
export default Sidebar