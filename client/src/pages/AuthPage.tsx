import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Lock, LogIn, Mail, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/useAuthStore'
import MemoraWordmark from '@/assets/brand/Memora.svg'

type Mode = 'login' | 'register'

interface LocationState {
  from?: { pathname: string }
}

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const config = useAuthStore((s) => s.config)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const loadConfig = useAuthStore((s) => s.loadConfig)
  const clearError = useAuthStore((s) => s.clearError)

  const location = useLocation()
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/'

  useEffect(() => {
    void loadConfig()
  }, [loadConfig])

  const switchMode = (next: Mode) => {
    if (next === mode) return
    setMode(next)
    setLocalError(null)
    clearError()
  }

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!email.includes('@')) {
      setLocalError('Email inválido.')
      return
    }
    if (password.length < 6) {
      setLocalError('A senha deve ter ao menos 6 caracteres.')
      return
    }
    if (mode === 'register' && name.trim().length < 2) {
      setLocalError('Informe seu nome.')
      return
    }

    if (mode === 'login') {
      await login({ email: email.trim(), password })
    } else {
      await register({ name: name.trim(), email: email.trim(), password })
    }
  }

  const displayError = localError ?? error

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)] px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.22), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-20 h-[460px] w-[460px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.18), transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="glass relative w-full max-w-md p-8">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <img src={MemoraWordmark} alt="MEMORA" className="h-8 w-auto" draggable={false} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {mode === 'login'
                ? 'Entre para acessar seus decks e estatísticas.'
                : 'Comece a gerar flashcards com IA em segundos.'}
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Modo de autenticação"
          className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-1"
        >
          <button
            role="tab"
            aria-selected={mode === 'login'}
            type="button"
            onClick={() => switchMode('login')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              mode === 'login'
                ? 'bg-[linear-gradient(135deg,#a855f7,#6366f1)] text-white shadow-[0_8px_24px_-10px_rgba(168,85,247,0.7)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Entrar
          </button>
          <button
            role="tab"
            aria-selected={mode === 'register'}
            type="button"
            onClick={() => switchMode('register')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              mode === 'register'
                ? 'bg-[linear-gradient(135deg,#a855f7,#6366f1)] text-white shadow-[0_8px_24px_-10px_rgba(168,85,247,0.7)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {mode === 'register' && (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              autoComplete="name"
              leftIcon={<UserIcon size={16} strokeWidth={1.5} />}
            />
          )}
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            autoComplete="email"
            leftIcon={<Mail size={16} strokeWidth={1.5} />}
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            leftIcon={<Lock size={16} strokeWidth={1.5} />}
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
            type="submit"
            size="lg"
            disabled={loading}
            leftIcon={<LogIn size={18} strokeWidth={1.75} />}
            className="w-full"
          >
            {loading
              ? 'Processando…'
              : mode === 'login'
                ? 'Entrar'
                : 'Criar conta'}
          </Button>

          {config?.googleOAuth && (
            <p className="mt-2 text-center text-[11px] text-[var(--color-text-dim)]">
              Login com Google disponível — integre o SDK para ativar o botão.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
