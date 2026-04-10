import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { FileText, Sparkles, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Slider } from '@/components/ui/Slider'
import { useDeckStore } from '@/stores/useDeckStore'
import { cn } from '@/lib/cn'

export function UploadZone() {
  const [topic, setTopic] = useState('')
  const [qty, setQty] = useState(20)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const generating = useDeckStore((s) => s.generating)
  const generate = useDeckStore((s) => s.generate)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setFile(files[0])
    if (!topic) setTopic(files[0].name.replace(/\.[^.]+$/, ''))
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const canSubmit = topic.trim().length > 2 && !generating

  const handleGenerate = async () => {
    if (!canSubmit) return
    await generate(topic.trim(), qty)
    setTopic('')
    setFile(null)
  }

  return (
    <section
      data-reveal
      className="conic-border glass-strong relative overflow-hidden p-6 md:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT: Drag-drop */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-10 text-center transition-all',
            dragging
              ? 'border-[rgba(168,85,247,0.7)] bg-white/[0.06]'
              : 'border-[var(--color-border-strong)] bg-white/[0.02] hover:bg-white/[0.04]',
          )}
        >
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.md,.docx"
            onChange={onPickFile}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#a855f7,#6366f1)] text-white shadow-[0_16px_40px_-10px_rgba(168,85,247,0.6)]">
            <UploadCloud size={22} strokeWidth={1.5} />
          </div>
          {file ? (
            <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <FileText size={16} strokeWidth={1.5} />
              <span className="font-medium">{file.name}</span>
              <span className="text-[var(--color-text-dim)]">
                ({(file.size / 1024).toFixed(0)} KB)
              </span>
            </div>
          ) : (
            <>
              <p className="font-display text-lg font-semibold leading-snug tracking-tight text-[var(--color-text)]">
                Arraste um PDF, TXT ou Markdown
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                ou clique para selecionar · até 10 MB
              </p>
            </>
          )}
        </div>

        {/* RIGHT: Controls */}
        <div className="flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
                Tópico do deck
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Fisiologia cardiovascular"
                leftIcon={<Sparkles size={16} strokeWidth={1.5} />}
              />
            </div>
            <Slider
              value={qty}
              min={5}
              max={50}
              step={5}
              onChange={setQty}
              label="Quantidade de cards"
            />
          </div>

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
