import TelaHome from "./telaHome/index.tsx"


function App() {

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

  class User{
    nome:string;
    decks:Array<Deck>;
    constructor(nome:string,
                decks:Array<Deck>)
    {
      this.nome = nome;
      this.decks = decks;
    }
  }

  return(<TelaHome/>)
  
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
  export class User{
    nome:string;
    decks:Array<Deck>;
    constructor(nome:string,
                decks:Array<Deck>)
    {
      this.nome = nome;
      this.decks = decks;
    }
  }