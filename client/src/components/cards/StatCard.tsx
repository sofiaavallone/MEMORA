import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useCountUp } from '@/hooks/useCountUp'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  icon: ReactNode
  sparkline: number[]
  tone?: 'purple' | 'indigo' | 'pink' | 'cyan'
}

const TONE_MAP: Record<
  NonNullable<StatCardProps['tone']>,
  { stroke: string; glow: string; accent: string }
> = {
  purple: {
    stroke: '#a855f7',
    glow: 'rgba(168,85,247,0.35)',
    accent: 'text-[#c084fc]',
  },
  indigo: {
    stroke: '#6366f1',
    glow: 'rgba(99,102,241,0.35)',
    accent: 'text-[#818cf8]',
  },
  pink: {
    stroke: '#ec4899',
    glow: 'rgba(236,72,153,0.35)',
    accent: 'text-[#f472b6]',
  },
  cyan: {
    stroke: '#22d3ee',
    glow: 'rgba(34,211,238,0.35)',
    accent: 'text-[#67e8f9]',
  },
}

export function StatCard({
  label,
  value,
  suffix,
  prefix,
  decimals,
  icon,
  sparkline,
  tone = 'purple',
}: StatCardProps) {
  const counterRef = useCountUp<HTMLSpanElement>({
    to: value,
    suffix,
    prefix,
    decimals,
  })
  const pathRef = useRef<SVGPathElement>(null)

  // build sparkline path
  const W = 120
  const H = 36
  const max = Math.max(...sparkline)
  const min = Math.min(...sparkline)
  const range = max - min || 1
  const step = W / (sparkline.length - 1)
  const d = sparkline
    .map((v, i) => {
      const x = i * step
      const y = H - ((v - min) / range) * H
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')

  useEffect(() => {
    const el = pathRef.current
    if (!el) return
    const len = el.getTotalLength()
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len })
    const tween = gsap.to(el, {
      strokeDashoffset: 0,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [d])

  void ScrollTrigger
  const t = TONE_MAP[tone]

  return (
    <div
      className="glass group relative overflow-hidden p-5 transition-transform duration-300 ease-out hover:-translate-y-1"
      data-reveal
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-70"
        style={{ background: `radial-gradient(circle, ${t.glow}, transparent 70%)` }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-dim)]">
            {label}
          </p>
          <p className="mt-2 font-mono text-[34px] font-semibold leading-none tracking-tight text-[var(--color-text)] tabular-nums">
            <span ref={counterRef}>0</span>
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ${t.accent}`}>
          {icon}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="relative mt-5 h-9 w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`spark-${tone}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={t.stroke} stopOpacity="0.2" />
            <stop offset="100%" stopColor={t.stroke} stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke={`url(#spark-${tone})`}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
