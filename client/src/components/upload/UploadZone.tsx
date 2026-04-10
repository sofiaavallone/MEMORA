import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Slider } from '@/components/ui/Slider'
import { useDeckStore } from '@/stores/useDeckStore'

export function UploadZone() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [qty, setQty] = useState(20)
  const [pdfUrl, setPdfUrl] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const generating = useDeckStore((s) => s.generating)
  const generate = useDeckStore((s) => s.generate)
  const storeError = useDeckStore((s) => s.error)

  const canSubmit = topic.trim().length > 2 && !generating

  const handleGenerate = async () => {
    setError(null)
    if (!canSubmit) return
    if (pdfUrl && !/^https?:\/\//i.test(pdfUrl)) {
      setError('Informe uma URL de PDF válida (http/https) ou deixe em branco.')
      return
    }
    try {
      const deck = await generate({
        topic: topic.trim(),
        quantity: qty,
        ...(pdfUrl.trim() ? { pdfUrl: pdfUrl.trim() } : {}),
        ...(sourceName.trim() ? { sourceName: sourceName.trim() } : {}),
      })
      setTopic('')
      setPdfUrl('')
      setSourceName('')
      navigate(`/decks/${deck.id}`)
    } catch {
      // erro já vai para o store; exibido abaixo
    }
  }

  const displayError = error ?? storeError

  return (
    <section
      data-reveal
      className="conic-border glass-strong relative overflow-hidden p-6 md:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
              Tópico do deck *
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Fisiologia cardiovascular"
              leftIcon={<Sparkles size={16} strokeWidth={1.5} />}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
              URL de um PDF (opcional)
            </label>
            <Input
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://exemplo.com/material.pdf"
              leftIcon={<Link2 size={16} strokeWidth={1.5} />}
            />
            <p className="mt-1.5 text-[11px] text-[var(--color-text-dim)]">
              Se informado, a IA vai usar o PDF como fonte. Caso contrário, gera apenas com o tópico.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
              Nome da fonte (opcional)
            </label>
            <Input
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="Ex: Capítulo 4 — Guyton"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6">
          <Slider
            value={qty}
            min={5}
            max={50}
            step={5}
            onChange={setQty}
            label="Quantidade de cards"
          />

          {displayError && (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-lg border border-[rgba(236,72,153,0.3)] bg-[rgba(236,72,153,0.08)] px-3 py-2 text-xs text-[#fda4af]"
            >
              {displayError}
            </p>
          )}

          <Button
            onClick={handleGenerate}
            disabled={!canSubmit}
            size="lg"
            leftIcon={<Sparkles size={18} strokeWidth={1.75} />}
            className="w-full"
          >
            {generating ? 'Gerando…' : 'Gerar Flashcards'}
          </Button>
        </div>
      </div>
    </section>
  )
}
