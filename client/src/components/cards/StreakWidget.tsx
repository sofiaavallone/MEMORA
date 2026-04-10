import { useEffect, useRef } from 'react'
import { Flame } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { useDeckStore } from '@/stores/useDeckStore'
import { cn } from '@/lib/cn'

export function StreakWidget() {
  const streak = useDeckStore((s) => s.streak)
  const flameRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = flameRef.current
    if (!el) return
    const tl = gsap.to(el, {
      scale: 1.08,
      rotate: -3,
      duration: 1.1,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      transformOrigin: '50% 70%',
    })
    return () => {
      tl.kill()
    }
  }, [])

  const days = streak?.currentDays ?? 7
  const last7 = streak?.last7 ?? Array(7).fill(true)

  return (
    <div className="glass relative overflow-hidden p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(251,146,60,0.35), transparent 70%)',
        }}
      />
      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#f97316,#ec4899)] text-white shadow-[0_8px_24px_-6px_rgba(236,72,153,0.55)]">
          <Flame ref={flameRef} size={20} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-dim)]">
            Sequência
          </p>
          <p className="font-mono text-[22px] font-semibold leading-none tracking-tight">
            {days}
            <span className="ml-1.5 font-sans text-xs font-normal text-[var(--color-text-muted)]">
              dias
            </span>
          </p>
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-1.5">
        {last7.map((studied, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              studied
                ? 'bg-[linear-gradient(90deg,#f97316,#ec4899)]'
                : 'bg-white/10',
            )}
          />
        ))}
      </div>
    </div>
  )
}
