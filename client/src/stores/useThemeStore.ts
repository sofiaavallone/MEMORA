import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  toggle(): void
  setTheme(theme: Theme): void
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggle() {
        set((s) => {
          const next: Theme = s.theme === 'dark' ? 'light' : 'dark'
          applyTheme(next)
          return { theme: next }
        })
      },
      setTheme(theme) {
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: 'memora-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    },
  ),
)
