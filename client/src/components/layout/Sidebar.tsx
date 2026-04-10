import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  LayoutGrid,
  LogOut,
  Upload,
  User,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { StreakWidget } from '@/components/cards/StreakWidget'
import MemoraWordmark from '@/assets/brand/Memora.svg'
import MemoraDarkWordmark from '@/assets/brand/MemoraEscura.svg'
import { useAuthStore } from '@/stores/useAuthStore'
import { useDeckStore } from '@/stores/useDeckStore'
import { useThemeStore } from '@/stores/useThemeStore'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const NAV: NavItem[] = [
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/', label: 'Meus Decks', icon: LayoutGrid, end: true },
  { to: '/stats', label: 'Estatísticas', icon: BarChart3 },
  { to: '/profile', label: 'Perfil', icon: User },
]

export function Sidebar() {
  const theme = useThemeStore((s) => s.theme)
  const wordmark = theme === 'dark' ? MemoraWordmark : MemoraDarkWordmark
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const resetDecks = useDeckStore((s) => s.reset)

  const handleLogout = async () => {
    await logout()
    resetDecks()
  }

  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? 'M'

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside
        className={cn(
          'sticky top-0 z-20 hidden h-screen flex-col gap-8 py-8 md:flex',
          'md:w-[84px] md:px-3 lg:w-[260px] lg:px-5',
        )}
      >
        <div className="glass flex h-full flex-col gap-7 p-4 lg:p-5">
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
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-sm font-medium transition-colors lg:px-4',
                    isActive
                      ? 'bg-[linear-gradient(135deg,rgba(168,85,247,0.18),rgba(99,102,241,0.04))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(168,85,247,0.6)]'
                      : 'text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]',
                  )
                }
              >
                {({ isActive }) => (
                  <>
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
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Streak (desktop only) */}
          <div className="mt-auto hidden lg:block">
            <StreakWidget />
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between gap-3 lg:mt-0">
            <ThemeToggle />
            <div className="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sair"
                title="Sair"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-[rgba(236,72,153,0.5)] hover:text-[#fda4af]"
              >
                <LogOut size={15} strokeWidth={1.5} />
              </button>
              <div
                aria-label={user?.name ?? 'Usuário'}
                title={user?.name ?? ''}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#a855f7,#ec4899)] text-xs font-semibold text-white"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="glass fixed inset-x-3 bottom-3 z-30 flex h-16 items-center justify-around rounded-full px-2 md:hidden"
        aria-label="Navegação principal"
      >
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                'flex h-12 w-12 items-center justify-center rounded-full transition-all',
                isActive
                  ? 'bg-[linear-gradient(135deg,#a855f7,#6366f1)] text-white shadow-[0_8px_24px_-6px_rgba(168,85,247,0.6)]'
                  : 'text-[var(--color-text-muted)]',
              )
            }
          >
            <Icon size={20} strokeWidth={1.5} />
          </NavLink>
        ))}
      </nav>
    </>
  )
}
