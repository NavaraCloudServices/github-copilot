import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout/Layout'
import ErrorBoundary from './components/Common/ErrorBoundary'
import Landing from './pages/Landing'
import TeamView from './pages/TeamView'
import HostView from './pages/HostView'
import PublicLeaderboard from './pages/PublicLeaderboard'
import JoinPage from './pages/JoinPage'
import NotFound from './pages/NotFound'
import ResourcesPage from './pages/ResourcesPage'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/join/:leaderboardId" element={<JoinPage />} />
              <Route path="/team/:leaderboardId?" element={<TeamView />} />
              <Route path="/host/:leaderboardId?" element={<HostView />} />
              <Route path="/leaderboard/:leaderboardId" element={<PublicLeaderboard />} />
              <Route path="/resources/:leaderboardId" element={<ResourcesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App