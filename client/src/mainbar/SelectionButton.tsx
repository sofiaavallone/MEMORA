type selectionbutton = {
    text:Number,
    click:Function,
}

function SelectionButton(prop:selectionbutton){
    function onclick(){
        prop.click(prop.text)//por isso prop.text é dada como um número
    }
    return(
    <button onClick={onclick}>
        {String(prop.text)}
    </button>
    )
}
export default SelectionButton