//props recebidas:
//
//prop.index: index do objeto deck que está sendo utilizado
//
//prop.array: array de todos os decks
//
//prop.set_decks: função que seta o array de decks
//

import {Deck} from "../../app/App.tsx"

type flashcarddisplay = {
    index:number
    array:Array<Deck>
    set_decks:Function
}

function FlashcardDisplay(prop:flashcarddisplay){

    const deck:Deck = prop.array[prop.index];
    let flashcard_index:number = deck.estado_atual[0];
    let flashcard_state:number = deck.estado_atual[1];

    async function updateDeck(){
        let tempArray:Array<Deck> = [...prop.array]
        tempArray[prop.index] = deck
        fazer_taxa_de_acerto()
        //aqui teria também o fetch para atualização do deck
        prop.set_decks(tempArray)
    }

    function voltar(){//função para voltar o flashcard ao mudar os indexes e rerenderizar a página
        if (flashcard_state==1){
            flashcard_state=0;
            deck.estado_atual[1]=flashcard_state
        }
        else if(flashcard_index>0){
            flashcard_index = flashcard_index - 1;
            deck.estado_atual[0]=flashcard_index
            deck.cards_revisados-=1
        }
        updateDeck()
    }

    function avançar(){//função para avançar o flashcard ao mudar os indexes e rerenderizar a página
        if (flashcard_state == 0){
            flashcard_state = 1;
            deck.estado_atual[1]=flashcard_state
        }
        else {
            deck.cards_revisados+=1
            flashcard_index = flashcard_index + 1;
            flashcard_state = 0;
            deck.estado_atual[0]=flashcard_index
            deck.estado_atual[1]=flashcard_state
        }
        updateDeck()
    }

    function acertar(){//função que marca o flashcard como certo
        deck.flashcards[flashcard_index].resposta = 1
        avançar()
    }

    function errar(){//função que marca o flashcard como errado
        deck.flashcards[flashcard_index].resposta = 0
        avançar()
    }

    function fazer_taxa_de_acerto(){//cálculo da taxa de acerto
        let sum:number=0;
        for (let i=0;i<flashcard_index;i+=1){
            sum+=deck.flashcards[i].resposta
        }
        deck.taxa_de_acerto=sum
    }

    if (flashcard_index<deck.flashcards.length){//checagem se o deck já acabou
        
        if (flashcard_state==0) {//display da frente do flashcard
        return(
            <div>
            <button onClick={voltar}>voltar</button>
            <p>{deck.flashcards[flashcard_index].frente}</p>
            <button onClick={avançar}>mostrar resposta</button>
            </div>)
        }
        else if (flashcard_state==1){//display do verso do flashcard
        return(
            <div>
            <p>{deck.flashcards[flashcard_index].verso}</p>
            <button onClick={errar}>errei❌</button>
            <button onClick={acertar}>acertei✅</button>
            </div>)
        }
        }
    else {
        console.log(deck)
        return(<div>Você terminou o deck de {deck.título} por hoje!
                 <br/>
                 Parabéns!
               </div>)
    }
}
export default FlashcardDisplay