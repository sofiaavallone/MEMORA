import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/stores/useThemeStore'
import { cn } from '@/lib/cn'

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="relative flex h-9 w-16 items-center rounded-full border border-[var(--color-border)] bg-white/[0.04] px-1 transition-colors hover:bg-white/[0.08]"
    >
      <span
        className={cn(
          'absolute top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#a855f7,#6366f1)] text-white shadow-[0_4px_16px_-2px_rgba(168,85,247,0.5)] transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)]',
          isDark ? 'left-1' : 'left-[calc(100%-2rem)]',
        )}
      >
        {isDark ? (
          <Moon size={14} strokeWidth={1.75} />
        ) : (
          <Sun size={14} strokeWidth={1.75} />
        )}
      </span>
      <span className="sr-only">Alternar tema</span>
    </button>
  )
}
