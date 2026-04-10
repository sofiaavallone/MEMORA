//props recebidas:
//
//prop.nav_state: variável que diz o estado de navegador em deckpage,
//                ou seja, deck, resumo e questões
//                será necessário no futuro para aplicação de tailwind
//
//prop.nav_change: função que define a página atual,
//                 usada para permitir a navegação
//

import NavButton from "./navButton.tsx"

type navbar = {
    nav_state:string
    nav_change:Function //talvez seja melhor mudar no futuro? parece não ser recomendado
}

function NavBar(prop:navbar){
    //retorna os botões de navegação
    return(<div>
              <NavButton text={"deck"} nav_change={prop.nav_change}/>
              <NavButton text={"resumo"} nav_change={prop.nav_change}/>
              <NavButton text={"questões"} nav_change={prop.nav_change}/>
           </div>)
}
export default NavBar