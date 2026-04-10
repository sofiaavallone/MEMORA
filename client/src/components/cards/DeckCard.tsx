import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Layers } from 'lucide-react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import type { Deck, DeckColor } from '@/types/domain'

const COLOR_MAP: Record<DeckColor, { from: string; to: string; glow: string }> = {
  purple: { from: '#a855f7', to: '#6366f1', glow: 'rgba(168,85,247,0.45)' },
  indigo: { from: '#6366f1', to: '#22d3ee', glow: 'rgba(99,102,241,0.45)' },
  pink: { from: '#ec4899', to: '#a855f7', glow: 'rgba(236,72,153,0.45)' },
  cyan: { from: '#22d3ee', to: '#6366f1', glow: 'rgba(34,211,238,0.45)' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return `há ${d}d`
}

interface DeckCardProps {
  deck: Deck
}

const FALLBACK_COLORS = COLOR_MAP.purple

export function DeckCard({ deck }: DeckCardProps) {
  const navigate = useNavigate()
  const cardRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const colors = COLOR_MAP[deck.color as DeckColor] ?? FALLBACK_COLORS

  const progress =
    deck.cardCount > 0 ? Math.round((deck.studiedCount / deck.cardCount) * 100) : 0

  useEffect(() => {
    const el = cardRef.current
    const bar = barRef.current
    if (!el || !bar) return

    const tween = gsap.fromTo(
      bar,
      { width: '0%' },
      {
        width: `${progress}%`,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    )

    const enter = () =>
      gsap.to(el, {
        y: -8,
        scale: 1.015,
        duration: 0.35,
        ease: 'power3.out',
      })
    const leave = () =>
      gsap.to(el, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power3.out',
      })
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
    }
  }, [progress])

  void ScrollTrigger

  return (
    <article
      ref={cardRef}
      data-reveal
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/decks/${deck.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/decks/${deck.id}`)
        }
      }}
      aria-label={`Abrir deck ${deck.title}`}
      className="glass group relative cursor-pointer overflow-hidden p-6 will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(168,85,247,0.6)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`,
          filter: 'blur(12px)',
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-[0_8px_24px_-6px_rgba(168,85,247,0.5)]"
          style={{
            background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
          }}
        >
          <Layers size={18} strokeWidth={1.75} />
        </div>
        <button
          type="button"
          aria-label="Abrir deck"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/[0.03] text-[var(--color-text-muted)] transition-all group-hover:border-[rgba(168,85,247,0.5)] group-hover:text-white"
        >
          <ArrowUpRight size={16} strokeWidth={1.75} />
        </button>
      </div>

      <div className="relative mt-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-dim)]">
          {deck.topic}
        </p>
        <h3 className="mt-1 font-display text-[19px] font-semibold leading-tight tracking-tight text-[var(--color-text)]">
          {deck.title}
        </h3>
      </div>

      <div className="relative mt-6">
        <div className="flex items-baseline justify-between font-mono text-xs tabular-nums text-[var(--color-text-muted)]">
          <span>
            {deck.studiedCount}
            <span className="text-[var(--color-text-dim)]">/{deck.cardCount} cards</span>
          </span>
          <span className="text-[var(--color-text)]">{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            ref={barRef}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
              width: '0%',
            }}
          />
        </div>
      </div>

      <div className="relative mt-5 flex items-center justify-between text-[11px] text-[var(--color-text-dim)]">
        <span>{timeAgo(deck.updatedAt)}</span>
        <span className="font-mono tabular-nums">
          {(deck.accuracy * 100).toFixed(0)}% acerto
        </span>
      </div>
    </article>
  )
}
