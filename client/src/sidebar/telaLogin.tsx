//props recebidas:
//
//prop.sair: função que remove a janela de login

import { useState } from 'react'

type telalogin = {
    sair:Function//talvez deva ser removido no futuro? parece não ser recomendado
}
type objetomodal = {
    nome:string,
    email:string,
    senha:string,
    tipo_de_operação:string
}

function TelaLogin(prop:telalogin){

    const[loginPage, setLogin]=useState("entrar")//usado para saber o tipo de login: 
                                                 // entrar, sign up, esqueceu senha
    const[objetoModal, setModal]=useState<objetomodal>(
        {
        nome:"",
        email:"",
        senha:"",
        tipo_de_operação:"entrar"
        }
    )

    function resetModal(operação:string){
        setModal(
            {
            nome:"",
            email:"",
            senha:"",
            tipo_de_operação:operação
            }
        )
    }

    //funções de mudança de página

    function callSair(){
        resetModal("entrar")
        prop.sair()
    }
    function setEntrar(){
        resetModal("entrar")
        setLogin("entrar")
    }
    function setSignUp(){
        resetModal("sign up")
        setLogin("sign up")
    }
    function setEsqueceuSenha(){
        resetModal("esqueceu senha")
        setLogin("esqueceu senha")
    }

    //funções de registro de input

    function setNome(evento:React.FocusEvent<HTMLInputElement>){
        let input:objetomodal = {...objetoModal}
        input.nome = evento.target.value
        setModal(input)
    }

    function setEmail(evento:React.FocusEvent<HTMLInputElement>){
        let input:objetomodal = {...objetoModal}
        input.email = evento.target.value
        setModal(input)
    }

    function setSenha(evento:React.FocusEvent<HTMLInputElement>){
        let input:objetomodal = {...objetoModal}
        input.senha = evento.target.value
        setModal(input)
    }

    //função de envio

    async function enviarModal(){
        const objetoEnvio:FormData = new FormData()//criar um objeto FormData()
        
        objetoEnvio.append(//dar append na versão json do objeto
            "informações login e cadastro",
            JSON.stringify(objetoModal)//provavelmente vai ser melhor para esse caso só mandar o json
        )
        //faria o fetch() do tipo POST
        
        //const response = await fetch(
        //                             "URL",
        //                             {method: "POST",
        //                              body: objetoEnvio}
        //                            )
        //
        //console.log(response)

        //resetar tudo
        callSair()
    }


    if(loginPage=="entrar"){
    return(
        <div id="loginCenter">{/*div para centralizar a janela de login*/}
        
            <div id="loginWindow">
                <button onClick={callSair} id="loginLeave" type="button">X</button>{/*botão para sair da janela*/}
                <h1>Entrar no memora</h1>
                <br/>
                <h4>Email</h4>
                <input onBlur={setEmail} type="email" placeholder="seu@email.com"/>
                <br/>
                <h4>Senha</h4>
                <input onBlur={setSenha} type="Password" placeholder="••••••••"/>
                <button onClick={enviarModal}>entrar</button>{/*botão para submit*/}
                <button type="button" onClick={setEsqueceuSenha}>Esqueci minha senha</button>
                <br/>
                Não tem conta?
                <button type="button" onClick={setSignUp}>Criar conta</button>
            </div>
        </div>
    )}
    else if(loginPage=="sign up"){
    return(
        <div id="loginCenter">{/*div para centralizar a janela de login*/}
        
            <div id="loginWindow">
                <button onClick={callSair} id="loginLeave" type="button">X</button>{/*botão para sair da janela*/}
                <h1>Entrar no memora</h1>
                <br/>
                <h4>Nome</h4>
                <input onBlur={setNome} type="text" placeholder="Seu nome"/>
                <br/>
                <h4>Email</h4>
                <input onBlur={setEmail} type="email" placeholder="seu@email.com"/>
                <br/>
                <h4>Senha</h4>
                <input onBlur={setSenha} type="Password" placeholder="••••••••"/>
                <button onClick={enviarModal}>Criar conta</button>{/*botão para submit*/}
                <br/>
                Já tem conta?
                <button type="button" onClick={setEntrar}>Entrar</button>
            </div>
        </div>
    )}
    else if(loginPage=="esqueceu senha"){
    return(
        <div id="loginCenter">{/*div para centralizar a janela de login*/}
        
            <div id="loginWindow">
                <button onClick={callSair} id="loginLeave" type="button">X</button>{/*botão para sair da janela*/}
                <h1>Recuperar senha</h1>
                <br/>
                <h4>Email</h4>
                <input onBlur={setEmail} type="email" placeholder="seu@email.com"/>
                <button onClick={enviarModal}>Enviar email</button>{/*botão para submit*/}
                <button type="button" onClick={setEntrar}>Voltar ao login</button>
            </div>
        </div>
    )}
}
export default TelaLogin