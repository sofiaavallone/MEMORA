//props recebidas:
//
//prop.set_decks: função que define os decks do usuário
//                usado para adicionar um deck à coleção
//
//prop.decks: array que contém todos os decks
//            usado ao ser desestruturado para corretamente definir o novo array
//

import { useState } from 'react'
import { Deck, Flashcard } from "../app/App.tsx"

type objetoupload = {
    tópico: string,
    quantidade_flashcards: (number | null),
}
type uploadbox = {
    set_decks: Function
    decks: Array<Deck>
}

function UploadBox(prop: uploadbox) {
    const [faseUpload, setUpload] = useState("pdf") //variável de estado que define se está pedindo um arquivo ou as especificações
    const [myFile, setFile] = useState<File | null>(null)// variável de estado que contém o objeto arquivo
    const [objetoUpload, setObjeto] = useState<objetoupload>({ // variável de estado que contém o objeto de especificações
        tópico: "",
        quantidade_flashcards: null,
    })

    function storeArquivo(evento: React.ChangeEvent<HTMLInputElement>) {//altera a variável de arquivo e vai para a próxima página
        if (evento.target.files && evento.target.files.length > 0) {
            setFile(evento.target.files[0])
            setUpload("especificações")
        }
    }

    function storeTopico(evento: React.FocusEvent<HTMLInputElement>) {//amrazena o tópico no objeto de especificações
        let input = { ...objetoUpload }
        input.tópico = evento.target.value
        setObjeto(input)
    }

    function storeQuantidade(número: number) { //armazena a quantidade de flashcards que será gerada no objeto de especificações
        let input = { ...objetoUpload }
        input.quantidade_flashcards = número
        setObjeto(input)
    }

    async function sendArquivo() {//função que faz o fetch para o back-end
        if (!myFile) return;// eu acho que essa checagem é desnecessário porque já tem uma checagem em storeArquivo

        // console.log para teste
        //console.log(objetoUpload)
        //console.log(myFile)

        const objetoEnvio: FormData = new FormData()//criação de um objeto FormData
                                                    //isso permite que se envio um arquivo e um json no mesmo fetch
                                                    //o fetch do back-end pede um link, porém não consegui achar um jeito de fazer isso
                                                    //usar URL.createObject() aparentemente não funciona porque o link é apenas funcional dentro do browser
        
        objetoEnvio.append("especificações", JSON.stringify(objetoUpload))// adiciona o objeto de especificações ao objeto que serpa enviado
        objetoEnvio.append("arquivo", myFile, myFile.name)// adiciona o Blob/File (File é um tipo de Blob até onde eu sei) do arquivo que será enviado

        //corrigir erro em que é possível fazer dois fetchs um depois do outro,
        //o aqait faz com que se espere antes de mudar a tela, e por isso é possível fazer mais de um fetch enquanto se espera
        //talvez seja bom fazer uma tela de carregamento e usar um useEffect para começar o fetch na montagem da tela de carregamento

        try {//dentro de um bloco try para caso dê erro na tentativa de fetch dos cards
            const response = await fetch(
                "http://localhost:3001/api/generate",
                {
                    method: "POST",
                    body: objetoEnvio 
                }
            )

            //console.log de teste
            //console.log(response)
            const API_answer = await response.json()//transforma a resposta em um objeto manipulável

            //processo de criação de um novo deck e adição dos flashcards a ele
            let new_array: Array<Deck> = [...prop.decks]//desestruturação do array de decks para manipulação em um array temporário
            let new_deck: Deck = new Deck(objetoUpload.tópico || "Novo Deck", [])//criação de um deck vazio

            for (let card of API_answer.flashcards) { //os flashcards são adicionados ao deck vazio um por um
                new_deck.flashcards.push(new Flashcard(card.pergunta, card.resposta))
            }

            new_array.push(new_deck)//o deck é adicionado ao array temporário
            prop.set_decks(new_array)//o array de decks do usuário atual é modificado
                                     //nessa função de set_decks é importante ter um fetch para atualização dos dados do usuário
                                     //isso ainda NÃO foi feito
        }
        catch (Error) {//handling de erro simples
            console.log("erro no fetching dos dados")
            console.log(Error)
        }

        //reiniciação da página e dos objetos independente de como foi o fetch
        setUpload("pdf")
        setFile(null)
        setObjeto({
            tópico: "",
            quantidade_flashcards: null,
        })
    }

    if (faseUpload == "pdf") {
        return (
            <div className="w-full">
                <input
                    type="file"
                    accept=".pdf"
                    multiple={false}
                    onChange={storeArquivo}
                    id="upload_input"
                    className="hidden" 
                />
                
                <label 
                    htmlFor="upload_input"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="bg-fuchsia-50 p-4 rounded-full mb-4">
                            <svg className="w-8 h-8 text-fuchsia-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <p className="mb-2 text-lg font-semibold text-slate-700">Arraste PDFs, slides ou imagens aqui</p>
                        <p className="text-sm text-slate-500">ou clique para selecionar arquivos</p>
                    </div>
                </label>
            </div>
        )
    }
    
    else if (faseUpload == "especificações") {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-2xl mx-auto">
                
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg mb-8 border border-slate-200">
                    <div className="bg-fuchsia-100 p-3 rounded-lg text-fuchsia-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">{myFile?.name}</h4>
                        <p className="text-sm text-slate-500">{myFile ? (myFile.size / 1024).toFixed(0) : 0} KB</p>
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Qual tópico do material você quer estudar?</label>
                    <input 
                        onBlur={storeTopico} 
                        type="text" 
                        placeholder="Ex: Mitose e Meiose, Direitos Fundamentais..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-600 focus:border-transparent transition-shadow"
                    />
                    <p className="text-xs text-slate-500 mt-2">Especifique o tópico para gerar conteúdo mais focado e relevante</p>
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Quantos flashcards deseja gerar?</label>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => storeQuantidade(10)}
                            className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg transition-all duration-200 ${
                                objetoUpload.quantidade_flashcards === 10
                                    ? 'bg-fuchsia-800 text-white shadow-md scale-105' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                            }`}
                        >
                            10
                        </button>
                        <button 
                            onClick={() => storeQuantidade(30)}
                            className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg transition-all duration-200 ${
                                objetoUpload.quantidade_flashcards === 30 
                                    ? 'bg-fuchsia-800 text-white shadow-md scale-105' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                            }`}
                        >
                            30
                        </button>
                        <button 
                            onClick={() => storeQuantidade(50)}
                            className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg transition-all duration-200 ${
                                objetoUpload.quantidade_flashcards === 50
                                    ? 'bg-fuchsia-800 text-white shadow-md scale-105' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                            }`}
                        >
                            50
                        </button>
                    </div>
                </div>

        <button 
            onClick={sendArquivo}
            className="w-full flex items-center justify-center gap-2 bg-fuchsia-800 hover:bg-fuchsia-900 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                <path d="M20 3v4"/>
                <path d="M22 5h-4"/>
                <path d="M4 17v2"/>
                <path d="M5 18H3"/>
            </svg>
            Gerar flashcards com IA
        </button>
            </div>
        )
    }
}

export default UploadBox