import { useState } from 'react'
import TelaLogin from "./telaLogin.tsx"
import "./loginButton.css"

function LoginButton() {
  const [mostrarTela, setMostrar] = useState<boolean>(false)

  
  const abrir = () => setMostrar(true)
  const fechar = () => setMostrar(false)

  return (
    <>
      <button onClick={abrir} id="login">
        entrar
      </button>

      {mostrarTela && <TelaLogin sair={fechar} />}
    </>
  )
}

export default LoginButton