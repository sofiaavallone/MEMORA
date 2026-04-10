import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/useAuthStore'

function greet(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Boa madrugada'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

interface TopBarProps {
  onOpenAuth(): void
}

export function TopBar({ onOpenAuth }: TopBarProps) {
  const user = useAuthStore((s) => s.user)
  const name = user?.name ?? 'visitante'

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
          Painel
        </p>
        <h2 className="mt-1 font-display text-[clamp(24px,2.4vw,32px)] font-semibold leading-tight tracking-tight">
          {greet()},{' '}
          <span className="gradient-text">{name.split(' ')[0]}</span>.
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Buscar decks, cards, tópicos…"
            leftIcon={<Search size={17} strokeWidth={1.5} />}
            rightSlot={
              <kbd className="hidden rounded-md border border-[var(--color-border)] bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-dim)] md:inline">
                ⌘K
              </kbd>
            }
          />
        </div>
        <Button variant="icon" aria-label="Notificações">
          <Bell size={18} strokeWidth={1.5} />
        </Button>
        {!user && (
          <Button variant="outline" size="sm" onClick={onOpenAuth}>
            Entrar
          </Button>
        )}
      </div>
    </div>
  )
}
