//props recebidas:
//
//prop.text: texto que o botão mostra
//
//prop.nav_change: função que define o estado da navegação atual
//

type navbutton = {
    text:string
    nav_change:Function //talvez seja melhor mudar? parece não ser recomendado
}

function NavButton(prop:navbutton){
    function goto(){
        prop.nav_change(prop.text)
    }
    return(<button onClick={goto}>{prop.text}</button>)
}
export default NavButton