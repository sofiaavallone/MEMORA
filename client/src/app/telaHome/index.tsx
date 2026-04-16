import { useState } from 'react'
import {Deck, Flashcard, User} from "../App.tsx"
import Sidebar from "../../sidebar/sidebar.tsx"
import Mainbar from "../../mainbar/mainbar.tsx"
import './index.css'

function TelaHome(){
    //set de user para protótipagem
    const [user, setUser] = useState<User>(new User("Visitante",[
        
        new Deck("Matemática",[new Flashcard("2+2","4"),
                                 new Flashcard("em qual ponto 2x+1 toca o eixo x?","(-0.5,0)")
          ]),
      
          new Deck("Inglês",[new Flashcard("how ___ you do?", "do"),
                             new Flashcard("traduza:\nhave you seen him?", "você viu ele?"),
                             new Flashcard("traduza:\neu moro em recife","I live in recife")]),
          
          new Deck("Geografia",[new Flashcard("onde fica a pedra do claranã?","bodocó")])
        ]))
      const [page_state, setPage] = useState<string>("upload")//variável de página atual
                                                              //usada para navegar pelo site
      const [current_deck, setCurrent] = useState<number>(0)//variável de deck atual
                                                            //usada para escolher um deck e mostrá-lo    
      
      function setDecks(decks:Array<Deck>){
        
        setUser(new User(
          user.nome,
          decks
        ))
      }
    
      return(
      <>
        <Sidebar state={page_state}
                 change={setPage}
                 user={user}
                 set_user={setUser}/>
        
        <Mainbar nome={user.nome}
                 state={page_state}//variável que representa o estado atual
                 change={setPage}//função que muda o estado atual
                 array={user.decks}//array que contém todos os decks
                 set_decks={setDecks}
                 current_deck={current_deck}//variável que diz o deck que está sendo usado
                                            //importante para permitir que os botões de deck entrem no deck certo
                 def_current_deck={setCurrent}//função que altera a variável de deck atual
                 />
      </>
      )
}

export default TelaHome