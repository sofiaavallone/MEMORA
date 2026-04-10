type sendbutton = {
    click:React.MouseEventHandler<HTMLButtonElement>,
}

function SendButton(prop:sendbutton){
    return(<button onClick={prop.click}>gerar flashcards com IA</button>)
}
export default SendButton