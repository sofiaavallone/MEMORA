import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useDeckStore } from '@/stores/useDeckStore'
import { useAuthStore } from '@/stores/useAuthStore'

export function AppShell() {
  const hydrate = useDeckStore((s) => s.hydrate)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (user) void hydrate()
  }, [user, hydrate])

  return (
    <div className="relative min-h-screen bg-[var(--color-bg)]">
      <div
        aria-hidden
        className="pointer-events-none fixed -left-40 top-0 h-[520px] w-[520px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.14), transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -right-40 bottom-0 h-[520px] w-[520px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div className="relative w-full px-4 pb-24 md:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1440px] gap-6">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col gap-10 py-8 pb-28 md:pb-8">
            <TopBar />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
