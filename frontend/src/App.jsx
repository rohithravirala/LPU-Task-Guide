import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Explore from './pages/Explore'
import Portals from './pages/Portals'
import TaskDetails from './modules/taskCatalogue/TaskDetails'
import JourneyPage from './modules/taskJourney/JourneyPage'
import HelpPage from './modules/studentHelp/HelpPage'
import { isLoggedIn } from './services/api'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function LoggedInLayout() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="md:flex">
        <Sidebar />
        <div className="min-w-0 flex-1 pb-20 md:pb-0">
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
        <Route path="/explore" element={<Explore />} />
        <Route element={<LoggedInLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/portals" element={<Portals />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/tasks/:taskId/journey" element={<JourneyPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
