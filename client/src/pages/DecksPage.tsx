import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { DeckCard } from '@/components/cards/DeckCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useDeckStore } from '@/stores/useDeckStore'

export function DecksPage() {
  const decks = useDeckStore((s) => s.decks)
  const loading = useDeckStore((s) => s.loading)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return decks
    return decks.filter(
      (d) =>
        d.title.toLowerCase().includes(q) || d.topic.toLowerCase().includes(q),
    )
  }, [decks, query])

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-dim)]">
            Biblioteca
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            Meus decks
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {decks.length} {decks.length === 1 ? 'deck' : 'decks'} no total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full md:w-72">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar por título ou tópico…"
              leftIcon={<Search size={16} strokeWidth={1.5} />}
            />
          </div>
          <Link to="/upload">
            <Button>Novo deck</Button>
          </Link>
        </div>
      </div>

      {loading && decks.length === 0 ? (
        <div className="glass flex min-h-[240px] items-center justify-center p-10 text-sm text-[var(--color-text-muted)]">
          Carregando…
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass flex min-h-[260px] flex-col items-center justify-center gap-3 p-10 text-center">
          <p className="font-display text-lg font-semibold text-[var(--color-text)]">
            {decks.length === 0 ? 'Nenhum deck ainda' : 'Nada encontrado'}
          </p>
          <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
            {decks.length === 0
              ? 'Comece criando seu primeiro deck no gerador.'
              : 'Tente ajustar sua busca ou limpar o filtro.'}
          </p>
          {decks.length === 0 && (
            <Link to="/upload" className="mt-2">
              <Button>Criar deck</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <DeckCard key={d.id} deck={d} />
          ))}
        </div>
      )}
    </>
  )
}
