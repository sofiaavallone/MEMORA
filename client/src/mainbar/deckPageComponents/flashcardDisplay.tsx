//props recebidas:
//
//prop.identifier: identificador do deck que está sendo usado
//                 nessa implementação o index
//
//prop.array: array de todos os decks
//
//prop.set_decks: função que seta o array de decks
//

import { Deck } from "../../app/App.tsx"

type flashcarddisplay = {
    identifier: number
    array: Array<Deck>
    set_decks: Function
}

function FlashcardDisplay(prop: flashcarddisplay) {

    //definição do deck que será usado a partir do identificador
    //prop.identifier pode ser alterado dependendo de como for feita a conexão entre a deckpage e o deckcard
    //nessa implementação é o index do deck

    const deck: Deck = prop.array[prop.identifier];

    let flashcard_index: number = deck.estado_atual[0];
    let flashcard_state: number = deck.estado_atual[1];

    async function updateDeck() {
        let tempArray: Array<Deck> = [...prop.array]
        tempArray[prop.identifier] = deck
        //aqui teria também o fetch para atualização do deck
        prop.set_decks(tempArray)
    }

    function revelar(){
        flashcard_state=1
        deck.estado_atual[1]=flashcard_state
        updateDeck()
    }

    function voltar() {//função para voltar o flashcard ao mudar os indexes e rerenderizar a página
        if (flashcard_index>0){//checa se está no primeiro flashcard
            flashcard_index-=1
            if (deck.flashcards[flashcard_index].revisado)//checa se o flashcard para o qual se está voltando já foi revisado
                flashcard_state=1 //caso tenha sido revisado ir para a resposta
            else
                flashcard_state=0 //caso não tenha ir para a pergunta
            deck.estado_atual[0] = flashcard_index
            deck.estado_atual[1] = flashcard_state
        }
        updateDeck()
    }

    function avançar() {//função para ir para o próoximo flashcard ao mudar os indexes e rerenderizar a página
        if (flashcard_index<(deck.flashcards.length-1)){//checa se está no último flashcard
            flashcard_index+=1
            if (deck.flashcards[flashcard_index].revisado)
                flashcard_state=1
            else
                flashcard_state=0
            deck.estado_atual[0] = flashcard_index
            deck.estado_atual[1] = flashcard_state
        }
        updateDeck()
    }

    function acertar() {//função que marca o flashcard como certo
        deck.flashcards[flashcard_index].resposta = 1
        deck.flashcards[flashcard_index].revisado = true
        deck.cards_revisados +=1
        fazer_taxa_de_acerto()
        updateDeck()
    }

    function errar() {//função que marca o flashcard como errado
        deck.flashcards[flashcard_index].resposta = 0
        deck.flashcards[flashcard_index].revisado = true
        deck.cards_revisados +=1
        fazer_taxa_de_acerto()
        updateDeck()
    }

    function fazer_taxa_de_acerto() {//cálculo da taxa de acerto
        let sum: number = 0;
        for (let i = 0; i <= flashcard_index; i += 1) {
            sum += deck.flashcards[i].resposta
        }
        deck.taxa_de_acerto = sum
    }

    function reiniciar(){//volta para o flashcard inicial
        flashcard_index=0
        flashcard_state=0
        deck.estado_atual[0]=flashcard_index
        deck.estado_atual[1]=flashcard_state
        for (let i = 0; i < deck.flashcards.length;i+=1){//itera por todos os flashcards do deck e reseta eles
            deck.flashcards[i].resposta = 0 //reseta o card para a resposta padrão de errado
            deck.flashcards[i].revisado = false //reseta o card para não ter sido revisado
        }
        deck.cards_revisados = 0
        fazer_taxa_de_acerto()
        updateDeck()
    }

    if (flashcard_index < deck.flashcards.length) {//checagem se o deck já acabou

        if (flashcard_state == 0) {//display da frente do flashcard
            return (
                <div className="w-full max-w-4xl mx-auto flex flex-col mt-8">
                    <div className="w-full bg-mauve-100 h-1.5 rounded-full mt-4">
                        <div 
                            className="bg-fuchsia-800 h-1.5 rounded-full transition-[width] duration-400" 
                            style={{ width: String(100 * (flashcard_index + 1)/deck.flashcards.length)+"%" }} 
                        ></div>
                    </div>
                    <div className="flex justify-end w-full mb-4 text-sm font-medium text-slate-400">
                        {flashcard_index + 1} / {deck.flashcards.length}
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 min-h-[350px] flex flex-col items-center justify-center shadow-sm relative">
                        <span className="text-fuchsia-800 font-semibold tracking-widest text-sm uppercase mb-6">
                            Pergunta
                        </span>
                        
                        <p className="text-3xl text-slate-800 text-center font-medium max-w-2xl leading-tight">
                            {deck.flashcards[flashcard_index].frente}
                        </p>
                        
                        <button 
                            onClick={revelar} 
                            className="mt-12 text-fuchsia-700 hover:text-fuchsia-900 font-medium transition-colors"
                        >
                            Clique para revelar
                        </button>
                    </div>

                    <div> {/* div para mostrar o número de acertos e erros */}
                        { deck.cards_revisados>0 //faz com que só apareça depois do primeiro acerto/erro
                            &&
                          <div className="flex p-1 w-full justify-center">
                            <p className="text-emerald-600">{deck.taxa_de_acerto} acertos</p>
                            <pre className="text-mauve-200">  •  </pre>
                            <p className="text-red-600"> {deck.cards_revisados-deck.taxa_de_acerto} erros</p>
                          </div>}
                    </div>

                    <div className="flex items-center justify-between mt-8 text-slate-400">
                        {/* botão que volta para o flashcard anterior */}
                        <button onClick={voltar}
                                className={flashcard_index>0 //desativa o hover caso seja o primeiro flashcard
                                ? "hover:text-slate-600 p-2"
                                : "p-2"}>
                            {/* símbolo de flecha pra esquerda */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>

                        {/* botão para reiniciar o deck */}
                        <button onClick={reiniciar} className="text-sm font-medium"> reiniciar </button>

                        {/* botão que vai para o próximo falshcard */}
                        <button onClick={avançar}
                                className={flashcard_index < (deck.flashcards.length-1) //desativa o hover caso seja o último flashcard
                                           ? "hover:text-slate-600 p-2"
                                           : "p-2"}>
                            {/* símbolo de flecha pra direita */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                        </button>
                    </div>
                </div>
            )
        }
        else if (flashcard_state == 1) {//display do verso do flashcard
            return (
                <div className="w-full max-w-4xl mx-auto flex flex-col mt-8">
                    <div className="w-full bg-mauve-100 h-1.5 rounded-full mt-4">
                        <div 
                            className="bg-fuchsia-800 h-1.5 rounded-full transition-[width] duration-400" 
                            style={{ width: String(100 * (flashcard_index + 1)/deck.flashcards.length)+"%" }} 
                        ></div>
                    </div>
                    <div className="flex justify-end w-full mb-4 text-sm font-medium text-slate-400">
                        {flashcard_index + 1} / {deck.flashcards.length}
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 min-h-[350px] flex flex-col items-center justify-center shadow-sm relative">
                        <span className="text-fuchsia-800 font-semibold tracking-widest text-sm uppercase mb-6">
                            Resposta
                        </span>
                        
                        <p className="text-3xl text-slate-800 text-center font-medium max-w-2xl leading-tight">
                            {deck.flashcards[flashcard_index].verso}
                        </p>
                    </div>

                    <div className="flex gap-4 mt-6">
                        {/* lógica para decidir o que mostrar no lado da resposta */}
                        { !deck.flashcards[flashcard_index].revisado
                            &&
                            <>
                        <button 
                            onClick={errar} 
                            className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl font-bold transition-colors"
                        >
                            Errei ❌
                        </button>
                        <button 
                            onClick={acertar} 
                            className="flex-1 py-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-xl font-bold transition-colors"
                        >
                            Acertei ✅
                        </button>
                        </>
                        }
                        { deck.flashcards[flashcard_index].revisado
                            &&
                          deck.flashcards[flashcard_index].resposta===1
                            &&
                          <div className="flex-1 py-4 text-center bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-bold">
                            ✓ Marcado como acerto
                          </div>
                        }
                        { deck.flashcards[flashcard_index].revisado
                            &&
                          deck.flashcards[flashcard_index].resposta===0
                            &&
                          <div className="flex-1 py-4 text-center bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold">
                            ✗ Marcado como erro
                          </div>
                        }
                        {/* fim da lógica */}
                    </div>
                    
                    <div> {/* div para mostrar o número de acertos e erros */}
                        { deck.cards_revisados>0 //faz com que só apareça depois do primeiro acerto/erro
                            &&
                          <div className="flex p-1 w-full justify-center">
                            <p className="text-emerald-600">{deck.taxa_de_acerto} acertos</p>
                            <pre className="text-mauve-200">  •  </pre>
                            <p className="text-red-600"> {deck.cards_revisados-deck.taxa_de_acerto} erros</p>
                          </div>}
                    </div>

                    <div className="flex items-center justify-between mt-8 text-slate-400">
                        {/* botão de ir para o flashcard anterior */}
                        <button onClick={voltar}
                                className={flashcard_index>0 //desativa o hover caso seja o primeiro flashcard
                                ? "hover:text-slate-600 p-2"
                                : "p-2"}>
                            {/* símbolo de seta para a esquerda */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>

                        {/* botão que reinicia o deck */}
                        <button onClick={reiniciar} className="text-sm font-medium"> reiniciar </button>

                        {/* botão de ir para o próximo flashcard */}
                        <button onClick={avançar}
                                className={flashcard_index < (deck.flashcards.length-1) //desativa o hover caso seja o último flashcard
                                           ? "hover:text-slate-600 p-2"
                                           : "p-2"}>
                            {/* símbolo de seta para a direita */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                        </button>
                    </div>
                </div>
            )
        }
    }
}

export default FlashcardDisplay