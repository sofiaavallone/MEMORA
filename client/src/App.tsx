import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/routing/ProtectedRoute'
import { AuthPageScreen } from '@/pages/AuthPageScreen'
import { DashboardPage } from '@/pages/DashboardPage'
import { DecksPage } from '@/pages/DecksPage'
import { DeckDetailPage } from '@/pages/DeckDetailPage'
import { StatsPage } from '@/pages/StatsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { UploadPage } from '@/pages/UploadPage'
import { useAuthStore } from '@/stores/useAuthStore'

function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const loadConfig = useAuthStore((s) => s.loadConfig)

  useEffect(() => {
    void bootstrap()
    void loadConfig()
  }, [bootstrap, loadConfig])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPageScreen />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="/decks" element={<DecksPage />} />
          <Route path="/decks/:id" element={<DeckDetailPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
