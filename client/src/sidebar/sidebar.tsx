import { useState } from 'react'
import { User } from "../app/App.tsx"
import TelaLogin from "./telaLogin.tsx"
import logoImg from './logo.png' 

type sidebarProps = { 
    user: User
    set_user: Function
    state: string
    change: Function
}

function Sidebar(prop: sidebarProps) {

    const [mostrarTela, setMostrar] = useState<boolean>(false)

    const abrir = () => setMostrar(true)
    const fechar = () => setMostrar(false)

    const notRevisedCardsSum = prop.user.decks.reduce((acc, deck) => {
        return acc + (deck.flashcards.length - deck.cards_revisados);
    }, 0);

    const cardsSum = prop.user.decks.reduce((acc, deck) => {
        return acc + (deck.flashcards.length);
    }, 0);

    const revisedPercentage = () => {
        const percentage = String( ( (cardsSum-notRevisedCardsSum) / cardsSum ) * 100)
        return percentage+"%"
    }

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col">
            <div className="shrink-0 flex justify-center py-8">
                {/* logo */}
                <div className="bg-fuchsia-800 text-white font-bold text-2xl px-8 py-3 rounded-2xl"> 
                    <img 
                        src={logoImg} 
                        alt="Logo Memora" 
                        className="h-15 w-auto object-contain"
                    />
                </div>
            </div>

            <nav className="flex-1 px-4 flex flex-col gap-2 mt-2">
                {/* botão de Upload */}
                <button 
                onClick={() => prop.change("upload")} 
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    prop.state === "upload" 
                    ? 'bg-fuchsia-100 text-fuchsia-900' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                >
                Upload
                </button>

                {/* botão de Meus Decks */}
                <button 
                onClick={() => prop.change("decks")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    prop.state === "decks" 
                    ? 'bg-fuchsia-100 text-fuchsia-900' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                >
                Meus Decks
                </button>
            </nav>

            <div className="shrink-0 px-4 pb-6 flex flex-col gap-4 mt-auto">
                {/* widget */}
                <div className="bg-fuchsia-50 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-slate-900">Revisão diária</h2>
                    <p className="text-xs text-slate-600 mt-1">
                        Você tem <span className="font-bold text-fuchsia-800">{notRevisedCardsSum}</span> card(s) para revisar hoje.
                    </p>
                    
                    {/* Barrinha de progresso*/}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3">
                        <div 
                            className="bg-fuchsia-800 h-1.5 rounded-full" 
                            style={{ width: revisedPercentage() }} 
                        ></div>
                    </div>
                </div>

                {/* botão de login */}
                <button 
                    onClick={abrir} 
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-100 transition-colors"
                >
                    {/* Ícone de "Login" do protótipo */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Entrar
                </button>

                {mostrarTela && <TelaLogin sair={fechar} />}
            </div>
        </aside>
    );
}

export default Sidebar