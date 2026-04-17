//props recebidas:
//
//prop.nav_state: variável que diz o estado de navegador em deckpage,
//                ou seja, deck, resumo e questões
//                será necessário no futuro para aplicação de tailwind
//
//prop.nav_change: função que define a página atual,
//                usada para permitir a navegação
//
//prop.deck: o deck que está sendo visualizado
//           usado aqui para obter quantidade de flashcards, resumos e questões (que serão implementadas no futuro) entre outras
//

import { Deck } from "../../app/App.tsx"

type navbar = {
    nav_state: string
    nav_change: Function //talvez seja melhor mudar no futuro? parece não ser recomendado
    deck: Deck
}

function NavBar(prop: navbar) {
    //retorna os botões de navegação
    return (
        <nav className="flex p-1 justify-around border-b border-slate-200 w-full mb-8 bg-mauve-100">
            <button
                onClick={()=>{prop.nav_change("Flashcards")}}
                className={`p-2 text-center font-semibold capitalize transition-all w-xs rounded-lg ${
                    prop.nav_state === "Flashcards"
                        ? 'text-slate-800 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
                {"Flashcards" + " (" + String(prop.deck.flashcards.length) + ")"}
            </button>
            <button
                onClick={()=>{prop.nav_change("resumo")}}
                className={`p-2 text-center font-semibold capitalize transition-all w-xs rounded-lg ${
                    prop.nav_state === "resumo"
                        ? 'text-slate-800 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
                resumo
            </button>
            <button 
                onClick={()=>{prop.nav_change("questões")}}
                className={`p-2 text-center font-semibold capitalize transition-all w-xs rounded-lg ${
                    prop.nav_state === "questões"
                        ? 'text-slate-800 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
                questões
            </button>
        </nav>
    )
}

export default NavBar