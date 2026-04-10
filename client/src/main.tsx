import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { initSmoothScroll } from './lib/smooth-scroll'
import { useThemeStore } from './stores/useThemeStore'

// Apply theme before first paint to prevent FOUC
const theme = useThemeStore.getState().theme
document.documentElement.setAttribute('data-theme', theme)

// Initialize Lenis + GSAP ticker once at app bootstrap
initSmoothScroll()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
