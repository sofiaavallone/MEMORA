import { useState } from 'react'
import { Deck, Flashcard } from "../app/App.tsx"
import SelectionButton from "./selectionButton.tsx"
import './UploadBox.css'

type objetoupload = {
  tópico:string,
  quantidade_flashcards:(Number|null),
}
type uploadbox = {
  set_decks:Function//mudar depois
  decks:Array<Deck>
}

function UploadBox(prop:uploadbox) {
  const [faseUpload, setUpload]=useState("pdf")//estados: pdf, especificações
  const [objetoUpload, setObjeto]=useState<objetoupload>(//depois resolver a falta de tipagem desse objeto
    {
      tópico:"",
      quantidade_flashcards:null,
    }
  )
  const [myFile, setFile] = useState(new Blob())

  function storeFile(evento:React.ChangeEvent<HTMLInputElement>) {//tá com tipo any porque senão ele reclama quando vou dar assign
    setFile(evento.target.files[0])
    setUpload("especificações")
  }

  function storeTopico(evento:React.FocusEvent<HTMLInputElement>){
    let input = {...objetoUpload}
    input.tópico = evento.target.value
    console.log(myFile)
    setObjeto(input)
  }
  
  function storeQuantidade(número:any){//pra não reclamar quando for dar assign, mas deveria ser número
    let input = {...objetoUpload}
    input.quantidade_flashcards = número
    setObjeto(input)
  }

  async function sendArquivo(){
      const objetoEnvio:FormData = new FormData()
      //append do objeto de especificações
      objetoEnvio.append("especificações",
                      JSON.stringify(objetoUpload))
      //append do arquivo
      objetoEnvio.append("arquivo",
                              myFile,
                              "upload.pdf")
      try{
        const response = await fetch(
                                   "http://localhost:3001/api/generate",
                                   {method: "POST",
                                    body: objetoEnvio}//envia um objeto FormData que conterá o arquivo e as especificações
                                  )
        
        console.log(response)
        
        const API_answer = await response.json()//faz o parsing da resposta para criar um objeto válido

        //const API_answer = {
        //  flashcards:[{pergunta:"teste1",resposta:"teste1"},
        //              {pergunta:"teste2",resposta:"teste2"},
        //              {pergunta:"teste3",resposta:"teste3"}
        //  ]
        //}

        let new_array:Array<Deck> = [...prop.decks]
        let new_deck:Deck = new Deck(objetoUpload.tópico,[])

        for (let i = 0;i<API_answer.flashcards.length;i=i+1){//adiciona os flashcards criados ao novo deck
          new_deck.flashcards.push(new Flashcard(API_answer.flashcards[i].pergunta,
                                                 API_answer.flashcards[i].resposta))
        }

        new_array.push(new_deck)//adiciona o novo deck temporário a um array temporário
        prop.set_decks(new_array)//altera definitivamente a coleção do usuário
      }
      catch (Error){
        console.log("erro no fetching dos dados")
        console.log(Error)
      }
      //
      
      //
      //resposta de protótipo para testar a geração do deck:
      //resetar tudo
      setUpload("pdf")
      setFile(new Blob())
      setObjeto(
        {
          tópico:"",
          quantidade_flashcards:null,
        }
      )
  }
  


  if (faseUpload=="pdf"){

  return (
    <div className="upload-wrapper">
      <label id="upload_box" htmlFor="upload_input">
        <p>Arraste PDFs, slides ou imagens aqui</p>
        <p>ou clique para selecionar arquivos</p>
      </label>
      
      <input 
        type="file"
        accept=".pdf"
        multiple={true}
        onChange={storeFile}
        id="upload_input" 
      />
    </div>
  )
  }
  else if(faseUpload=="especificações"){
    return(
    <div>
      {/*div que mostra o arquivo selecionado*/}
      <div>
        <h4>{myFile.name}</h4>{/*ele dá esse erro por ser considerado um Blob em vez de um File*/}
        <p>{(myFile.size/1024).toFixed(0)}KB</p>
      </div>
      {/*input de tópico*/}
      <p>qual tópico do material você quer estudar?</p>
      <input onBlur={storeTopico} type="text" placeholder="Ex: Mitose e Meiose, Direitos Fundamentais, Farmacocinética..."></input>
      <p>Especifique o tópico para gerar conteúdo mais focado e relevante</p>
      <p>Quantos flashcards deseja gerar?</p>
      {/*div dis botões de quantidade*/}
      <div>
        <SelectionButton current_number={objetoUpload.quantidade_flashcards} text={10} click={storeQuantidade}/>
        <SelectionButton current_number={objetoUpload.quantidade_flashcards} text={30} click={storeQuantidade}/>
        <SelectionButton current_number={objetoUpload.quantidade_flashcards} text={50} click={storeQuantidade}/>
      </div>
      {/*botão de envio*/}
      <button onClick={sendArquivo}>gerar flashcards com IA</button>
    </div>
    )
  }
}

export default UploadBox