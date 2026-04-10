import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenisInstance: Lenis | null = null

export function initSmoothScroll(): Lenis {
  if (lenisInstance) return lenisInstance

  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.2,
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((t) => {
    lenis.raf(t * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  lenisInstance = lenis
  return lenis
}

export function getLenis(): Lenis | null {
  return lenisInstance
}
