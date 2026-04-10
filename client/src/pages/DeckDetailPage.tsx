import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { api } from '@/services/api'
import { HttpError } from '@/lib/httpClient'
import { Button } from '@/components/ui/Button'
import { useDeckStore } from '@/stores/useDeckStore'
import type { Deck } from '@/types/domain'

export function DeckDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const removeDeck = useDeckStore((s) => s.remove)

  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flippedId, setFlippedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    let alive = true
    const run = async () => {
      try {
        const d = await api.getDeck(id)
        if (!alive) return
        setDeck(d)
        setError(null)
      } catch (e) {
        if (!alive) return
        if (e instanceof HttpError && e.status === 404) {
          setError('Deck não encontrado.')
        } else {
          setError(e instanceof Error ? e.message : 'Erro ao carregar deck.')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    void run()
    return () => {
      alive = false
    }
  }, [id])

  const handleDelete = async () => {
    if (!deck) return
    const confirmed = window.confirm(`Excluir o deck "${deck.title}"? Essa ação é irreversível.`)
    if (!confirmed) return
    setDeleting(true)
    await removeDeck(deck.id)
    setDeleting(false)
    navigate('/decks')
  }

  if (loading) {
    return (
      <div className="glass flex min-h-[280px] items-center justify-center p-10 text-sm text-[var(--color-text-muted)]">
        Carregando deck…
      </div>
    )
  }

  if (error || !deck) {
    return (
      <div className="glass flex min-h-[280px] flex-col items-center justify-center gap-3 p-10 text-center">
        <p className="font-display text-lg font-semibold text-[var(--color-text)]">
          {error ?? 'Deck não encontrado'}
        </p>
        <Link to="/decks">
          <Button variant="outline">Voltar aos decks</Button>
        </Link>
      </div>
    )
  }

  const flashcards = deck.flashcards ?? []

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            to="/decks"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Voltar aos decks
          </Link>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            {deck.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {deck.topic} · {deck.cardCount} cards
            {deck.sourceName ? ` · fonte: ${deck.sourceName}` : ''}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleDelete}
          disabled={deleting}
          leftIcon={<Trash2 size={16} strokeWidth={1.5} />}
        >
          {deleting ? 'Excluindo…' : 'Excluir deck'}
        </Button>
      </div>

      {flashcards.length === 0 ? (
        <div className="glass flex min-h-[220px] items-center justify-center p-10 text-sm text-[var(--color-text-muted)]">
          Este deck ainda não tem flashcards.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {flashcards.map((card, index) => {
            const flipped = flippedId === card.id
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setFlippedId(flipped ? null : card.id)}
                aria-pressed={flipped}
                className="glass group relative min-h-[180px] overflow-hidden p-6 text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(168,85,247,0.6)]"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-dim)]">
                  Card #{index + 1} · {flipped ? 'Resposta' : 'Pergunta'}
                </p>
                <p className="mt-3 font-display text-lg font-medium leading-snug text-[var(--color-text)]">
                  {flipped ? card.answer : card.question}
                </p>
                <p className="mt-4 text-[11px] text-[var(--color-text-dim)]">
                  {flipped ? 'Clique para ver a pergunta' : 'Clique para revelar a resposta'}
                </p>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
