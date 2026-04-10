import { forwardRef, useEffect } from 'react'
import { BookMarked, Flame, Target, Timer } from 'lucide-react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { StatCard } from '@/components/cards/StatCard'
import { DeckCard } from '@/components/cards/DeckCard'
import { UploadZone } from '@/components/upload/UploadZone'
import { useDeckStore } from '@/stores/useDeckStore'

interface DashboardProps {
  onOpenAuth(): void
}

export const Dashboard = forwardRef<HTMLElement, DashboardProps>(
  function Dashboard({ onOpenAuth }, ref) {
    const decks = useDeckStore((s) => s.decks)
    const stats = useDeckStore((s) => s.stats)
    const hydrate = useDeckStore((s) => s.hydrate)

    useEffect(() => {
      hydrate()
    }, [hydrate])

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

    return (
      <section
        ref={ref}
        className="relative w-full px-4 pb-24 md:px-8 lg:px-10"
      >
        <div className="mx-auto flex w-full max-w-[1440px] gap-6">
          <Sidebar />

          <main className="flex min-w-0 flex-1 flex-col gap-10 py-8 pb-28 md:pb-8">
            <TopBar onOpenAuth={onOpenAuth} />

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              <StatCard
                label="Total de decks"
                value={stats?.totalDecks ?? 6}
                icon={<BookMarked size={18} strokeWidth={1.5} />}
                sparkline={stats?.sparkline.decks ?? [2, 3, 3, 4, 5, 5, 6]}
                tone="purple"
              />
              <StatCard
                label="Estudados hoje"
                value={stats?.studiedToday ?? 47}
                icon={<Flame size={18} strokeWidth={1.5} />}
                sparkline={stats?.sparkline.studied ?? [12, 28, 19, 34, 22, 41, 47]}
                tone="pink"
              />
              <StatCard
                label="Precisão"
                value={Math.round((stats?.accuracy ?? 0.83) * 100)}
                suffix="%"
                icon={<Target size={18} strokeWidth={1.5} />}
                sparkline={
                  (stats?.sparkline.accuracy ?? [0.62, 0.68, 0.74, 0.71, 0.79, 0.81, 0.83]).map(
                    (v) => v * 100,
                  )
                }
                tone="indigo"
              />
              <StatCard
                label="Minutos hoje"
                value={stats?.minutesToday ?? 52}
                suffix=" min"
                icon={<Timer size={18} strokeWidth={1.5} />}
                sparkline={stats?.sparkline.minutes ?? [18, 24, 30, 22, 38, 44, 52]}
                tone="cyan"
              />
            </div>

            {/* Upload zone */}
            <UploadZone />

            {/* Decks grid */}
            <div>
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-dim)]">
                    Biblioteca
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                    Meus decks
                  </h3>
                </div>
                <span className="font-mono text-sm tabular-nums text-[var(--color-text-muted)]">
                  {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {decks.map((d) => (
                  <DeckCard key={d.id} deck={d} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </section>
    )
  },
)
