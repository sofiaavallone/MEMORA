import './logo.css'
import logoImg from './logo.png' 

function Logo() {
    return (
        <div id="logo-container"> {}
            <img 
                src={logoImg} 
                alt="Logo Memora" 
                className="logo-image"
            />
        </div>
    )
}

export default Logo