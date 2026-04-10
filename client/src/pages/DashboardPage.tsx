import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookMarked, Flame, Target, Timer } from 'lucide-react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { StatCard } from '@/components/cards/StatCard'
import { DeckCard } from '@/components/cards/DeckCard'
import { useDeckStore } from '@/stores/useDeckStore'
import { Button } from '@/components/ui/Button'

function formatMinutes(sec: number): number {
  return Math.round(sec / 60)
}

export function DashboardPage() {
  const decks = useDeckStore((s) => s.decks)
  const stats = useDeckStore((s) => s.stats)
  const streak = useDeckStore((s) => s.streak)
  const loading = useDeckStore((s) => s.loading)

  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>('[data-reveal]')
    const batch = ScrollTrigger.batch(elements, {
      start: 'top 88%',
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            overwrite: true,
          },
        ),
      once: true,
    })
    return () => {
      batch.forEach((st) => st.kill())
    }
  }, [decks.length])

  const sparklineValues = stats?.sparkline.map((p) => p.value) ?? [0, 0, 0, 0, 0, 0, 0]
  const recent = decks.slice(0, 6)

  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        <StatCard
          label="Total de decks"
          value={stats?.deckCount ?? 0}
          icon={<BookMarked size={18} strokeWidth={1.5} />}
          sparkline={sparklineValues}
          tone="purple"
        />
        <StatCard
          label="Cards estudados"
          value={stats?.cardsStudied ?? 0}
          icon={<Flame size={18} strokeWidth={1.5} />}
          sparkline={sparklineValues}
          tone="pink"
        />
        <StatCard
          label="Precisão"
          value={Math.round((stats?.accuracy ?? 0) * 100)}
          suffix="%"
          icon={<Target size={18} strokeWidth={1.5} />}
          sparkline={sparklineValues}
          tone="indigo"
        />
        <StatCard
          label="Minutos estudados"
          value={formatMinutes(stats?.totalDurationSec ?? 0)}
          suffix=" min"
          icon={<Timer size={18} strokeWidth={1.5} />}
          sparkline={sparklineValues}
          tone="cyan"
        />
      </div>

      {/* CTA para upload */}
      <section
        className="conic-border glass-strong relative overflow-hidden p-6 md:p-8"
        data-reveal
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
              Gerar com IA
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              Crie um deck novo a partir de um tópico ou PDF
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Envie material de estudo ou descreva o tema — a IA monta flashcards de alta
              qualidade em segundos.
            </p>
          </div>
          <Link to="/upload" className="shrink-0">
            <Button size="lg">Abrir gerador</Button>
          </Link>
        </div>
        {streak && streak.current > 0 && (
          <p className="mt-4 text-xs text-[var(--color-text-dim)]">
            Sequência atual: <span className="text-[var(--color-text)]">{streak.current} dias</span>
            {streak.longest > streak.current && (
              <> · Recorde: {streak.longest} dias</>
            )}
          </p>
        )}
      </section>

      {/* Decks grid */}
      <div>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-dim)]">
              Biblioteca
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              Decks recentes
            </h3>
          </div>
          <Link
            to="/decks"
            className="text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary-400)]"
          >
            Ver todos →
          </Link>
        </div>

        {loading && decks.length === 0 ? (
          <div className="glass flex min-h-[180px] items-center justify-center p-8 text-sm text-[var(--color-text-muted)]">
            Carregando seus decks…
          </div>
        ) : recent.length === 0 ? (
          <div className="glass flex min-h-[220px] flex-col items-center justify-center gap-3 p-10 text-center">
            <p className="font-display text-lg font-semibold text-[var(--color-text)]">
              Você ainda não tem decks
            </p>
            <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
              Gere seu primeiro deck enviando um PDF ou descrevendo um tópico no gerador.
            </p>
            <Link to="/upload" className="mt-2">
              <Button>Criar primeiro deck</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recent.map((d) => (
              <DeckCard key={d.id} deck={d} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
