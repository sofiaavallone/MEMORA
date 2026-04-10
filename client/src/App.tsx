import { useRef, useState } from 'react'
import { AtmosphereBg } from '@/components/layout/AtmosphereBg'
import { Hero } from '@/components/sections/Hero'
import { Dashboard } from '@/components/sections/Dashboard'
import { AuthModal } from '@/components/auth/AuthModal'
import { getLenis } from '@/lib/smooth-scroll'

function App() {
  const [authOpen, setAuthOpen] = useState(false)
  const dashboardRef = useRef<HTMLElement>(null)

  const scrollToDashboard = () => {
    const el = dashboardRef.current
    if (!el) return
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(el, { offset: -40, duration: 1.2 })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="atmosphere-noise relative min-h-screen">
      <AtmosphereBg />
      <Hero
        onOpenAuth={() => setAuthOpen(true)}
        onScrollToDashboard={scrollToDashboard}
      />
      <Dashboard ref={dashboardRef} onOpenAuth={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  )
}

export default App
