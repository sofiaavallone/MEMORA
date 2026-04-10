import { useState } from 'react'
import Sidebar from "../sidebar/sidebar.tsx"
import Mainbar from "../mainbar/mainbar.tsx"
import './App.css'


function App() {
  
  /*class User{

  }*/

  class Flashcard{

    frente:string;
    verso:string;
    tempo_de_espaçamento:number;
    resposta:number;

    constructor(frente:string,
                verso:string)
    {
      this.frente = frente;
      this.verso = verso;
      this.tempo_de_espaçamento = 0;
      this.resposta = 0;//0=errrado, 1=certo
    }
  }

  class Deck{

    título:string;
    flashcards:Array<Flashcard>;
    taxa_de_acerto:number;
    estado_atual:Array<number>;
    cards_revisados:number;

    constructor(título:string,
                flashcards:Array<Flashcard>)
    {
      this.título = título;
      this.flashcards = flashcards;
      this.taxa_de_acerto = 0;
      this.estado_atual = [0,0];
      this.cards_revisados = 0;
    }
  }
  
  //set inicial para protótipagem
  const [decks, setDecks] = useState<Array<Deck>>(//por enquanto setDecks não está sendo usado
                                                  //porém talvez seja importante no futuro,
                                                  //por isso o array de decks já foi implementado desse jeito
    [
      new Deck("Matemática",[new Flashcard("2+2","4"),
                             new Flashcard("em qual ponto 2x+1 toca o eixo x?","(-0.5,0)")
      ]),
  
      new Deck("Inglês",[new Flashcard("how ___ you do?", "do"),
                         new Flashcard("traduza:\nhave you seen him?", "você viu ele?"),
                         new Flashcard("traduza:\neu moro em recife","I live in recife")]),
      
      new Deck("Geografia",[new Flashcard("onde fica a pedra do claranã?","bodocó")])
    ]
  )
  const [page_state, setPage] = useState<string>("upload")//variável de página atual
                                                          //usada para navegar pelo site
  const [current_deck, setCurrent] = useState<number>(0)//variável de deck atual
                                                        //usada para escolher um deck e mostrá-lo

  return(
  <>
    <Sidebar state={page_state}
             change={setPage}
             array={decks}/>
    <Mainbar state={page_state}//variável que representa o estado atual
             change={setPage}//função que muda o estado atual
             array={decks}//array que contém todos os decks
             set_decks={setDecks}
             current_deck={current_deck}//variável que diz o deck que está sendo usado
                                        //importante para permitir que os botões de deck entrem no deck certo
             def_current_deck={setCurrent}//função que altera a variável de deck atual
             />
  </>
  )
}

//export do componente App e de suas classes para propósito de tipagem

export default App
// eslint-disable-next-line react-refresh/only-export-components
export   class Flashcard{

    frente:string;
    verso:string;
    tempo_de_espaçamento:number;
    resposta:number;

    constructor(frente:string,
                verso:string)
    {
      this.frente = frente;
      this.verso = verso;
      this.tempo_de_espaçamento = 0;
      this.resposta = 0;//0=errrado, 1=certo
    }
  }
// eslint-disable-next-line react-refresh/only-export-components
export class Deck{

    título:string;
    flashcards:Array<Flashcard>;
    taxa_de_acerto:number;
    estado_atual:Array<number>;
    cards_revisados:number;

    constructor(título:string,
                flashcards:Array<Flashcard>)
    {
      this.título = título;
      this.flashcards = flashcards;
      this.taxa_de_acerto = 0;
      this.estado_atual = [0,0];
      this.cards_revisados = 0;
    }
  }