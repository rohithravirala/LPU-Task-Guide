import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TaskDetails from './modules/taskCatalogue/TaskDetails'
import JourneyPage from './modules/taskJourney/JourneyPage'
import HelpPage from './modules/studentHelp/HelpPage'
import { isLoggedIn } from './services/api'

// Layout for every page after login: sidebar + navbar + the current page (<Outlet />).
// If the student is not logged in, send them to the login page instead.
function LoggedInLayout() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<LoggedInLayout />}>
          <Route path="/" element={<Dashboard />} />
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
