import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

/**
 * Full-page atmospheric background: two huge radial gradients
 * (purple top-left, pink bottom-right) that drift slowly forever.
 * Renders behind everything.
 */
export function AtmosphereBg() {
  const orb1 = useRef<HTMLDivElement>(null)
  const orb2 = useRef<HTMLDivElement>(null)
  const orb3 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1.current, {
        x: 60,
        y: 40,
        duration: 14,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
      gsap.to(orb2.current, {
        x: -50,
        y: -30,
        duration: 18,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
      gsap.to(orb3.current, {
        x: 30,
        y: -60,
        duration: 22,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        ref={orb1}
        className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vh] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle at center, rgba(168,85,247,0.55) 0%, rgba(168,85,247,0) 60%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        ref={orb2}
        className="absolute -bottom-[20%] -right-[10%] h-[75vh] w-[75vh] rounded-full opacity-55"
        style={{
          background:
            'radial-gradient(circle at center, rgba(236,72,153,0.5) 0%, rgba(236,72,153,0) 60%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        ref={orb3}
        className="absolute top-[30%] left-[40%] h-[45vh] w-[45vh] rounded-full opacity-40"
        style={{
          background:
            'radial-gradient(circle at center, rgba(99,102,241,0.45) 0%, rgba(99,102,241,0) 60%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  )
}
