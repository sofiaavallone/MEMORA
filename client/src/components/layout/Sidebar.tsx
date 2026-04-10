import { useState } from 'react'
import {
  BarChart3,
  LayoutGrid,
  Upload,
  User,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { StreakWidget } from '@/components/cards/StreakWidget'
import MemoraWordmark from '@/assets/brand/Memora.svg'
import { useThemeStore } from '@/stores/useThemeStore'
import MemoraDarkWordmark from '@/assets/brand/MemoraEscura.svg'

type NavKey = 'upload' | 'decks' | 'stats' | 'profile'

interface NavItem {
  key: NavKey
  label: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { key: 'upload', label: 'Upload', icon: Upload },
  { key: 'decks', label: 'Meus Decks', icon: LayoutGrid },
  { key: 'stats', label: 'Estatísticas', icon: BarChart3 },
  { key: 'profile', label: 'Perfil', icon: User },
]

export function Sidebar() {
  const [active, setActive] = useState<NavKey>('decks')
  const theme = useThemeStore((s) => s.theme)
  const wordmark = theme === 'dark' ? MemoraWordmark : MemoraDarkWordmark

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside
        className={cn(
          'sticky top-0 z-20 hidden h-screen flex-col gap-8 py-8 md:flex',
          'md:w-[76px] md:px-3 lg:w-[260px] lg:px-5',
        )}
      >
        <div className="glass flex flex-col gap-7 p-4 lg:p-5 h-full">
          {/* Brand */}
          <div className="flex h-10 items-center overflow-hidden px-1">
            <img
              src={wordmark}
              alt="MEMORA"
              className="hidden h-7 w-auto select-none lg:block"
              draggable={false}
            />
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#a855f7,#6366f1,#ec4899)] text-white shadow-[0_6px_24px_-6px_rgba(168,85,247,0.6)] lg:hidden">
              <span className="font-display text-base font-bold">M</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1.5">
            {NAV.map(({ key, label, icon: Icon }) => {
              const isActive = active === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    'lg:px-4',
                    isActive
                      ? 'bg-[linear-gradient(135deg,rgba(168,85,247,0.18),rgba(99,102,241,0.04))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(168,85,247,0.6)]'
                      : 'text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]',
                  )}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r bg-[linear-gradient(180deg,#a855f7,#ec4899)] shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                    />
                  )}
                  <Icon
                    size={19}
                    strokeWidth={1.5}
                    className={cn(
                      'shrink-0 transition-colors',
                      isActive && 'text-[var(--color-primary-400)]',
                    )}
                  />
                  <span className="hidden truncate lg:inline">{label}</span>
                </button>
              )
            })}
          </nav>

          {/* Streak (desktop only) */}
          <div className="mt-auto hidden lg:block">
            <StreakWidget />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 lg:mt-0 mt-auto">
            <ThemeToggle />
            <div className="hidden lg:flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#a855f7,#ec4899)] text-white text-xs font-semibold">
              L
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-3 bottom-3 z-30 flex h-16 items-center justify-around rounded-full glass px-2 md:hidden"
        aria-label="Navegação principal"
      >
        {NAV.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full transition-all',
                isActive
                  ? 'bg-[linear-gradient(135deg,#a855f7,#6366f1)] text-white shadow-[0_8px_24px_-6px_rgba(168,85,247,0.6)]'
                  : 'text-[var(--color-text-muted)]',
              )}
            >
              <Icon size={20} strokeWidth={1.5} />
            </button>
          )
        })}
      </nav>
    </>
  )
}
