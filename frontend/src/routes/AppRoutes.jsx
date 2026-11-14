import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute, { GuestOnlyRoute } from '../components/ProtectedRoute'
import { PageLoader } from '../components/Loader'
import StudentLayout from '../layouts/StudentLayout'
import PublicLayout from '../layouts/PublicLayout'
import AuthLayout from '../layouts/AuthLayout'

// Pages are code-split so each screen only downloads what it needs.
const LandingPage = lazy(() => import('../modules/taskCatalogue/pages/LandingPage'))
const Dashboard = lazy(() => import('../modules/taskCatalogue/pages/Dashboard'))
const TaskCatalogue = lazy(() => import('../modules/taskCatalogue/pages/TaskCatalogue'))
const TaskDetails = lazy(() => import('../modules/taskCatalogue/pages/TaskDetails'))
const ManageTasks = lazy(() => import('../modules/taskCatalogue/pages/ManageTasks'))
const CreateTask = lazy(() => import('../modules/taskCatalogue/pages/CreateTask'))
const EditTask = lazy(() => import('../modules/taskCatalogue/pages/EditTask'))
const TaskJourney = lazy(() => import('../modules/taskJourney/pages/TaskJourney'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        <Route
          element={
            <GuestOnlyRoute>
              <AuthLayout />
            </GuestOnlyRoute>
          }
        >
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          {/* Module 1: Task Catalogue */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<TaskCatalogue />} />
          <Route path="tasks/:slug" element={<TaskDetails />} />

          {/* Module 2, Part 1: Task Journey */}
          <Route path="tasks/:slug/journey" element={<TaskJourney />} />

          {/* Module 2, Part 2 (My Tasks, Progress) and Module 3 (Help) routes go here.
              Remember to set `ready: true` for them in config/navigation.js. */}

          <Route path="admin" element={<ProtectedRoute roles={['admin']} />}>
            <Route index element={<Navigate to="tasks" replace />} />
            <Route path="tasks" element={<ManageTasks />} />
            <Route path="tasks/new" element={<CreateTask />} />
            <Route path="tasks/:id/edit" element={<EditTask />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
