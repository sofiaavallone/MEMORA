import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Lock, LogIn, Mail, User as UserIcon } from 'lucide-react'

import MemoraWordmark from '@/assets/brand/Memora.svg'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/useAuthStore'

type Mode = 'login' | 'register'

interface LocationState {
  from?: { pathname: string }
}

let googleIdentityScriptPromise: Promise<void> | null = null

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Identity Services indisponivel.'))
  }

  if (window.google?.accounts.id) {
    return Promise.resolve()
  }

  if (!googleIdentityScriptPromise) {
    googleIdentityScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]',
      )

      if (existingScript) {
        if (window.google?.accounts.id) {
          resolve()
          return
        }

        existingScript.addEventListener('load', () => resolve(), { once: true })
        existingScript.addEventListener(
          'error',
          () => reject(new Error('Falha ao carregar o Google Identity Services.')),
          { once: true },
        )
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () =>
        reject(new Error('Falha ao carregar o Google Identity Services.'))
      document.head.appendChild(script)
    })
  }

  return googleIdentityScriptPromise
}

export function AuthPageScreen() {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)

  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const config = useAuthStore((s) => s.config)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const loadConfig = useAuthStore((s) => s.loadConfig)
  const clearError = useAuthStore((s) => s.clearError)

  const location = useLocation()
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/'

  useEffect(() => {
    void loadConfig()
  }, [loadConfig])

  useEffect(() => {
    if (
      mode !== 'register' ||
      !config?.googleOAuth ||
      !config.googleClientId ||
      !googleButtonRef.current
    ) {
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = ''
      }
      return
    }

    let cancelled = false
    const googleClientId = config.googleClientId

    const renderGoogleButton = async () => {
      try {
        await loadGoogleIdentityScript()
        if (cancelled || !googleButtonRef.current || !window.google?.accounts.id) return

        googleButtonRef.current.innerHTML = ''
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: ({ credential }) => {
            const idToken = credential?.trim()
            if (!idToken) {
              setLocalError('Nao foi possivel obter a credencial do Google.')
              return
            }

            setLocalError(null)
            void loginWithGoogle(idToken)
          },
        })
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signup_with',
          width: 320,
        })
      } catch (googleError) {
        if (!cancelled) {
          setLocalError(
            googleError instanceof Error
              ? googleError.message
              : 'Falha ao carregar o login com Google.',
          )
        }
      }
    }

    void renderGoogleButton()

    return () => {
      cancelled = true
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = ''
      }
    }
  }, [config?.googleClientId, config?.googleOAuth, loginWithGoogle, mode])

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
      setLocalError('Email invalido.')
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
                ? 'Entre para acessar seus decks e estatisticas.'
                : 'Comece a gerar flashcards com IA em segundos.'}
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Modo de autenticacao"
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
            placeholder="********"
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
            {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>

          {mode === 'register' && config?.googleOAuth && config.googleClientId && (
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-dim)]">
                <span className="h-px flex-1 bg-[var(--color-border)]" />
                <span>ou continue com</span>
                <span className="h-px flex-1 bg-[var(--color-border)]" />
              </div>
              <div className="flex justify-center">
                <div ref={googleButtonRef} aria-label="Cadastrar com Google" />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
