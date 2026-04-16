//props recebidas:
//
//prop.text: texto que será mostrado no botão
//           tembém é usado para saber se deveria estar ligado ou não
//
//prop.click: função para definir a quantidade de flashcards ao clicar
//
//prop.current_number: variável usada para saber se o botão deveria estar ligado ou não
//

type selectionbutton = {
    text:Number,
    click:Function,
    current_number:Number | null
}

function SelectionButton(prop:selectionbutton){
    function onclick(){
        prop.click(prop.text)//por isso prop.text é dada como um número
    }
    //if feito para estilização
    if (prop.current_number !== prop.text){
        return(
            <button className="bg-purple-400 size-12 border border-black-200 rounded-md" onClick={onclick}>
                {String(prop.text)}
            </button>
        )
    }
    else{
        return(
            <button className="bg-purple-500 size-12 border border-black-200 rounded-md" onClick={onclick}>
                {String(prop.text)}
            </button>
        )
    }
}
export default SelectionButton