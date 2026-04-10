import { LogOut, Mail, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/useAuthStore'
import { useDeckStore } from '@/stores/useDeckStore'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const resetDecks = useDeckStore((s) => s.reset)
  const stats = useDeckStore((s) => s.stats)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    resetDecks()
    navigate('/auth', { replace: true })
  }

  if (!user) return null

  const initial = user.name?.trim().charAt(0).toUpperCase() ?? 'M'
  const joined = new Date(user.createdAt).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-dim)]">
          Conta
        </p>
        <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Perfil
        </h2>
      </div>

      <section className="glass p-6 md:p-8">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#a855f7,#6366f1,#ec4899)] text-3xl font-semibold text-white shadow-[0_16px_40px_-10px_rgba(168,85,247,0.6)]">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="flex-1">
            <p className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              {user.name}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <Mail size={14} strokeWidth={1.5} />
              {user.email}
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
              <UserIcon size={12} strokeWidth={1.5} />
              Membro desde {joined}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            leftIcon={<LogOut size={16} strokeWidth={1.5} />}
          >
            Sair
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-dim)]">
            Decks criados
          </p>
          <p className="mt-2 font-mono text-[28px] font-semibold tabular-nums">
            {stats?.deckCount ?? 0}
          </p>
        </div>
        <div className="glass p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-dim)]">
            Flashcards
          </p>
          <p className="mt-2 font-mono text-[28px] font-semibold tabular-nums">
            {stats?.flashcardCount ?? 0}
          </p>
        </div>
        <div className="glass p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-dim)]">
            Precisão
          </p>
          <p className="mt-2 font-mono text-[28px] font-semibold tabular-nums">
            {Math.round((stats?.accuracy ?? 0) * 100)}%
          </p>
        </div>
      </section>
    </>
  )
}
