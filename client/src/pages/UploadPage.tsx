import { UploadZone } from '@/components/upload/UploadZone'

export function UploadPage() {
  return (
    <>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-dim)]">
          Gerador com IA
        </p>
        <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Criar novo deck
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
          Descreva um tópico e, se quiser, anexe um PDF como material de base. A IA monta os
          flashcards automaticamente em português.
        </p>
      </div>

      <UploadZone />
    </>
  )
}
