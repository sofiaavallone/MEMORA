import { BookMarked, Flame, Sparkles, Target, Timer } from 'lucide-react'
import { StatCard } from '@/components/cards/StatCard'
import { StreakWidget } from '@/components/cards/StreakWidget'
import { useDeckStore } from '@/stores/useDeckStore'

export function StatsPage() {
  const stats = useDeckStore((s) => s.stats)
  const streak = useDeckStore((s) => s.streak)
  const loading = useDeckStore((s) => s.loading)

  const sparkline = stats?.sparkline.map((p) => p.value) ?? [0, 0, 0, 0, 0, 0, 0]

  if (loading && !stats) {
    return (
      <div className="glass flex min-h-[260px] items-center justify-center p-10 text-sm text-[var(--color-text-muted)]">
        Carregando estatísticas…
      </div>
    )
  }

  return (
    <>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-dim)]">
          Progresso
        </p>
        <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Estatísticas
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        <StatCard
          label="Total de decks"
          value={stats?.deckCount ?? 0}
          icon={<BookMarked size={18} strokeWidth={1.5} />}
          sparkline={sparkline}
          tone="purple"
        />
        <StatCard
          label="Flashcards criados"
          value={stats?.flashcardCount ?? 0}
          icon={<Sparkles size={18} strokeWidth={1.5} />}
          sparkline={sparkline}
          tone="indigo"
        />
        <StatCard
          label="Cards estudados"
          value={stats?.cardsStudied ?? 0}
          icon={<Flame size={18} strokeWidth={1.5} />}
          sparkline={sparkline}
          tone="pink"
        />
        <StatCard
          label="Precisão"
          value={Math.round((stats?.accuracy ?? 0) * 100)}
          suffix="%"
          icon={<Target size={18} strokeWidth={1.5} />}
          sparkline={sparkline}
          tone="cyan"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="glass p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-dim)]">
                Tempo de estudo
              </p>
              <p className="mt-2 font-mono text-[32px] font-semibold leading-none tracking-tight tabular-nums">
                {Math.round((stats?.totalDurationSec ?? 0) / 60)}
                <span className="ml-2 font-sans text-sm font-normal text-[var(--color-text-muted)]">
                  minutos totais
                </span>
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-[#67e8f9]">
              <Timer size={18} strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                Acertos
              </p>
              <p className="mt-1 font-mono text-lg tabular-nums">
                {stats?.cardsCorrect ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                Erros
              </p>
              <p className="mt-1 font-mono text-lg tabular-nums">
                {(stats?.cardsStudied ?? 0) - (stats?.cardsCorrect ?? 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <StreakWidget />
          <div className="glass p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-dim)]">
              Recorde de sequência
            </p>
            <p className="mt-2 font-mono text-[28px] font-semibold leading-none tracking-tight tabular-nums">
              {streak?.longest ?? 0}
              <span className="ml-2 font-sans text-sm font-normal text-[var(--color-text-muted)]">
                dias consecutivos
              </span>
            </p>
            {streak?.lastStudiedAt && (
              <p className="mt-3 text-xs text-[var(--color-text-dim)]">
                Último estudo: {new Date(streak.lastStudiedAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
