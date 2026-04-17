//props recebidas:
//
//prop.sair: função que remove a janela de login

import { useState } from 'react'

type telalogin = {
    sair: Function//talvez deva ser removido no futuro? parece não ser recomendado
}
type objetomodal = {
    nome: string,
    email: string,
    senha: string,
    tipo_de_operação: string
}

function TelaLogin(prop: telalogin) {

    const [loginPage, setLogin] = useState("entrar")//usado para saber o tipo de login: 
                                                    // entrar, sign up, esqueceu senha
    const [objetoModal, setModal] = useState<objetomodal>(
        {
            nome: "",
            email: "",
            senha: "",
            tipo_de_operação: "entrar"
        }
    )

    function resetModal(operação: string) {
        setModal(
            {
                nome: "",
                email: "",
                senha: "",
                tipo_de_operação: operação
            }
        )
    }

    //funções de mudança de página

    function callSair() {
        resetModal("entrar")
        prop.sair()
    }
    function setEntrar() {
        resetModal("entrar")
        setLogin("entrar")
    }
    function setSignUp() {
        resetModal("sign up")
        setLogin("sign up")
    }
    function setEsqueceuSenha() {
        resetModal("esqueceu senha")
        setLogin("esqueceu senha")
    }

    //funções de registro de input

    function setNome(evento: React.FocusEvent<HTMLInputElement>) {
        let input: objetomodal = { ...objetoModal }
        input.nome = evento.target.value
        setModal(input)
    }

    function setEmail(evento: React.FocusEvent<HTMLInputElement>) {
        let input: objetomodal = { ...objetoModal }
        input.email = evento.target.value
        setModal(input)
    }

    function setSenha(evento: React.FocusEvent<HTMLInputElement>) {
        let input: objetomodal = { ...objetoModal }
        input.senha = evento.target.value
        setModal(input)
    }

    //função de envio

    async function enviarModal() {
        const objetoEnvio: FormData = new FormData()//criar um objeto FormData()
        
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

    const overlayClass = "fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
    const modalClass = "bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative"
    const closeBtnClass = "absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl transition-colors"
    const inputClass = "w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-600 focus:border-transparent mt-1 mb-4"
    const labelClass = "text-sm font-semibold text-slate-700 block"
    const mainBtnClass = "w-full bg-fuchsia-800 hover:bg-fuchsia-900 text-white font-medium py-3 rounded-lg transition-colors mt-2"
    const textBtnClass = "text-fuchsia-800 font-medium hover:text-fuchsia-900 transition-colors"

    if (loginPage == "entrar") {
        return (
            <div className={overlayClass}>{/*div para centralizar a janela de login*/}
            
                <div className={modalClass}>
                    <button onClick={callSair} className={closeBtnClass} type="button">X</button>{/*botão para sair da janela*/}
                    <h1 className="text-2xl font-bold text-slate-900 mb-6">Entrar no memora</h1>
                    <br />
                    <h4 className={labelClass}>Email</h4>
                    <input onBlur={setEmail} type="email" placeholder="seu@email.com" className={inputClass} />
                    <br />
                    <h4 className={labelClass}>Senha</h4>
                    <input onBlur={setSenha} type="Password" placeholder="••••••••" className={inputClass} />
                    <button onClick={enviarModal} className={mainBtnClass}>entrar</button>{/*botão para submit*/}
                    
                    <div className="flex flex-col items-center mt-6 gap-3 text-sm">
                        <button type="button" onClick={setEsqueceuSenha} className={textBtnClass}>Esqueci minha senha</button>
                        <br />
                        <p className="text-slate-600">
                            Não tem conta? <button type="button" onClick={setSignUp} className={textBtnClass}>Criar conta</button>
                        </p>
                    </div>
                </div>
            </div>
        )
    }
    else if (loginPage == "sign up") {
        return (
            <div className={overlayClass}>{/*div para centralizar a janela de login*/}
            
                <div className={modalClass}>
                    <button onClick={callSair} className={closeBtnClass} type="button">X</button>{/*botão para sair da janela*/}
                    <h1 className="text-2xl font-bold text-slate-900 mb-6">Entrar no memora</h1>
                    <br />
                    <h4 className={labelClass}>Nome</h4>
                    <input onBlur={setNome} type="text" placeholder="Seu nome" className={inputClass} />
                    <br />
                    <h4 className={labelClass}>Email</h4>
                    <input onBlur={setEmail} type="email" placeholder="seu@email.com" className={inputClass} />
                    <br />
                    <h4 className={labelClass}>Senha</h4>
                    <input onBlur={setSenha} type="Password" placeholder="••••••••" className={inputClass} />
                    <button onClick={enviarModal} className={mainBtnClass}>Criar conta</button>{/*botão para submit*/}
                    <br />
                    <div className="text-center mt-6 text-sm">
                        <p className="text-slate-600">
                            Já tem conta? <button type="button" onClick={setEntrar} className={textBtnClass}>Entrar</button>
                        </p>
                    </div>
                </div>
            </div>
        )
    }
    else if (loginPage == "esqueceu senha") {
        return (
            <div className={overlayClass}>{/*div para centralizar a janela de login*/}
            
                <div className={modalClass}>
                    <button onClick={callSair} className={closeBtnClass} type="button">X</button>{/*botão para sair da janela*/}
                    <h1 className="text-2xl font-bold text-slate-900 mb-6">Recuperar senha</h1>
                    <br />
                    <h4 className={labelClass}>Email</h4>
                    <input onBlur={setEmail} type="email" placeholder="seu@email.com" className={inputClass} />
                    <button onClick={enviarModal} className={mainBtnClass}>Enviar email</button>{/*botão para submit*/}
                    <div className="text-center mt-6">
                        <button type="button" onClick={setEntrar} className={textBtnClass}>Voltar ao login</button>
                    </div>
                </div>
            </div>
        )
    }
}
export default TelaLogin