import { useState } from 'react'
import { Deck, Flashcard, User } from "../App.tsx"
import Sidebar from "../../sidebar/sidebar.tsx"
import Mainbar from "../../mainbar/mainbar.tsx"
import './index.css'

function TelaHome() {
    const [user, setUser] = useState<User>(new User("Visitante", [
        new Deck("Matemática", [
            new Flashcard("2+2", "4"),
            new Flashcard("em qual ponto 2x+1 toca o eixo x?", "(-0.5,0)")
        ]),
        new Deck("Inglês", [
            new Flashcard("how ___ you do?", "do"),
            new Flashcard("traduza:\nhave you seen him?", "você viu ele?"),
            new Flashcard("traduza:\neu moro em recife", "I live in recife")
        ]),
        new Deck("Geografia", [
            new Flashcard("onde fica a pedra do claranã?", "bodocó")
        ])
    ]))
    
    const [page_state, setPage] = useState<string>("upload")
    const [identifier, setIdentifier] = useState<number>(1)

    function setDecks(decks: Array<Deck>) {
        setUser(new User(
            user.nome,
            decks
        ))
    }

    return (
        <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden">
            <Sidebar 
                state={page_state}
                change={setPage}
                user={user}
                set_user={setUser} 
            />

            <Mainbar 
                nome={user.nome}
                state={page_state}
                change={setPage}
                array={user.decks}
                set_decks={setDecks}
                identifier={identifier}
                def_identifier={setIdentifier}
            />
        </div>
    )
}

export default TelaHome