import { useEffect, useRef, useState, type FormEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Lock, Mail, User, X } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/useAuthStore'
import { cn } from '@/lib/cn'

type Mode = 'login' | 'register'

interface AuthModalProps {
  open: boolean
  onOpenChange(open: boolean): void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; name?: string }>({})

  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const loading = useAuthStore((s) => s.loading)
  const apiError = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const overlay = overlayRef.current
    const content = contentRef.current
    if (!overlay || !content) return
    const tl = gsap.timeline()
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      .fromTo(
        content,
        { opacity: 0, scale: 0.92, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' },
        '-=0.15',
      )
    return () => {
      tl.kill()
    }
  }, [open])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      clearError()
      setFieldErrors({})
    }
    onOpenChange(next)
  }

  const validate = (): boolean => {
    const errs: typeof fieldErrors = {}
    if (!EMAIL_RE.test(email)) errs.email = 'Email inválido.'
    if (password.length < 6) errs.password = 'A senha deve ter ao menos 6 caracteres.'
    if (mode === 'register' && name.trim().length < 2) errs.name = 'Informe seu nome.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const ok =
      mode === 'login'
        ? await login({ email, password })
        : await register({ name, email, password })
    if (ok) handleOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          ref={overlayRef}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
        />
        <Dialog.Content
          ref={contentRef}
          aria-describedby={undefined}
          className="glass-strong fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 p-7"
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <Dialog.Title asChild>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                  {mode === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}
                </h2>
              </Dialog.Title>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {mode === 'login'
                  ? 'Entre para continuar seus estudos.'
                  : 'Começe a memorizar em minutos.'}
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Fechar"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:bg-white/10 hover:text-[var(--color-text)]"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex rounded-full border border-[var(--color-border)] bg-white/[0.03] p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  mode === m
                    ? 'bg-[linear-gradient(135deg,#a855f7,#6366f1)] text-white shadow-[0_8px_24px_-6px_rgba(168,85,247,0.5)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                )}
              >
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <Input
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User size={16} strokeWidth={1.5} />}
                error={fieldErrors.name}
                autoComplete="name"
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} strokeWidth={1.5} />}
              error={fieldErrors.email}
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} strokeWidth={1.5} />}
              error={fieldErrors.password}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />

            {apiError && (
              <p
                className="rounded-xl border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.08)] px-3 py-2 text-xs text-[#fca5a5]"
                role="alert"
                aria-live="polite"
              >
                {apiError}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? 'Aguarde…'
                : mode === 'login'
                ? 'Entrar'
                : 'Criar conta'}
            </Button>

            <p className="text-center text-xs text-[var(--color-text-dim)]">
              {mode === 'login' ? 'Novo no MEMORA? ' : 'Já tem conta? '}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="font-medium text-[var(--color-primary-400)] hover:underline"
              >
                {mode === 'login' ? 'Criar conta' : 'Entrar'}
              </button>
            </p>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
