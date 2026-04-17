import TelaHome from "./telaHome/index.tsx"

export class Flashcard {
    frente: string;
    verso: string;
    tempo_de_espaçamento: number;
    resposta: number;
    revisado:boolean;

    constructor(frente: string, verso: string) {
        this.frente = frente;
        this.verso = verso;
        this.tempo_de_espaçamento = 0;
        this.resposta = 0; // 0 = errado, 1 = certo
        this.revisado = false // false = não foi revisado, true = foi revisado
    }
}

export class Deck {
    título: string;
    flashcards: Array<Flashcard>;
    taxa_de_acerto: number;
    estado_atual: Array<number>;
    cards_revisados: number;

    constructor(título: string, flashcards: Array<Flashcard>) {
        this.título = título;
        this.flashcards = flashcards;
        this.taxa_de_acerto = 0;
        this.estado_atual = [0, 0];
        this.cards_revisados = 0;
    }
}

export class User {
    nome: string;
    decks: Array<Deck>;

    constructor(nome: string, decks: Array<Deck>) {
        this.nome = nome;
        this.decks = decks;
    }
}

function App() {
    return (<TelaHome />)
}

export default App