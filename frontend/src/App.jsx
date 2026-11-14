import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Explore from './pages/Explore'
import Portals from './pages/Portals'
import TaskDetails from './modules/taskCatalogue/TaskDetails'
import JourneyPage from './modules/taskJourney/JourneyPage'
import HelpPage from './modules/studentHelp/HelpPage'
import { getStudent, isLoggedIn } from './services/api'

// Opening a new page starts at the top (the browser would otherwise keep the old scroll position)
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Layout for every page after login: header + orange side menu + the current page (<Outlet />).
// If the student is not logged in, send them to the login page instead.
function LoggedInLayout() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  const isDemo = Boolean(getStudent()?.isDemo)

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="md:flex">
        <Sidebar />
        <div className="min-w-0 flex-1 pb-20 md:pb-0">
          {/* Notice strip (like the orange strip on top of UMS) so evaluators know what is real */}
          {isDemo && (
            <p className="border-b border-saffron/40 bg-apricot-soft/70 px-4 py-2 text-center text-sm text-ink">
              <span className="font-bold">Demo account.</span> LPU has no public API, so “Your updates” is sample data. Tasks,
              menu paths and Open links are real.
            </p>
          )}
          <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-10 lg:py-9">
            <Outlet />
          </main>
          <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted sm:px-6 lg:px-10">
            LPU Task Guide is a student guidance project, not an official LPU website. Every task opens on the official portal.
          </footer>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Public: every task, without signing in */}
        <Route path="/explore" element={<Explore />} />

        <Route element={<LoggedInLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/portals" element={<Portals />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/tasks/:taskId/journey" element={<JourneyPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>

        {/* Any unknown address goes back to the dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
