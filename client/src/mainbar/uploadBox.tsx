import { useState } from 'react'
import SelectionButton from "./SelectionButton.tsx"
import SendButton from "./sendbutton.tsx"
import './UploadBox.css'

type objetoupload = {
  tópico:string,
  quantidade_flashcards:(number|null),
  tipo_de_operação:string,
}

function UploadBox() {
  const [faseUpload, setUpload]=useState("pdf")//estados: pdf, especificações
  const [objetoUpload, setObjeto]=useState<objetoupload>(//depois resolver a falta de tipagem desse objeto
    {
      tópico:"",
      quantidade_flashcards:null,
      tipo_de_operação:"criação de flashcard",
    }
  )
  const [myFile, setFile] = useState(new Blob())

  function storeFile(evento:React.ChangeEvent) {//tá com tipo any porque senão ele reclama quando vou dar assign
    setFile(evento.target.files[0])
    setUpload("especificações")
  }

  function storeTopico(evento:React.FocusEvent){
    let input = {...objetoUpload}
    input.tópico = evento.target.value
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
      
      const response = await fetch(
                                   "http://localhost:3001/api/generate",
                                   {method: "POST",
                                    body: objetoEnvio}
                                  )
      console.log(response)
      //resetar tudo
      setUpload("pdf")
      setFile(new Blob())
      setObjeto(
        {
          tópico:"",
          quantidade_flashcards:null,
          tipo_de_operação:"criação de flashcard",
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
      {/*input de tópico*/}
      <p>qual tópico do material você quer estudar?</p>
      <input onBlur={storeTopico} type="text" placeholder=""></input>
      <p>Especifique o tópico para gerar conteúdo mais focado e relevante</p>
      <p>Quantos flashcards deseja gerar?</p>
      {/*div dis botões de quantidade*/}
      <div>
        <SelectionButton text={10} click={storeQuantidade}/>
        <SelectionButton text={30} click={storeQuantidade}/>
        <SelectionButton text={50} click={storeQuantidade}/>
      </div>
      {/*botão de envio*/}
      <SendButton click={sendArquivo}/>
    </div>
    )
  }
}

export default UploadBox