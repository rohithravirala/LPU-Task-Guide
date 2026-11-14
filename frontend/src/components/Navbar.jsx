import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { getStudent, logout } from '../services/api'

// Top bar: who is logged in, and a logout button.
export default function Navbar() {
  const navigate = useNavigate()
  const student = getStudent()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex items-center justify-end gap-4 border-b border-line bg-surface px-4 py-3 sm:px-6 lg:px-8">
      <p className="text-sm text-stone-deep">
        Signed in as <span className="font-semibold text-ink">{student?.name}</span>
      </p>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg border border-line-strong px-3 py-1.5 text-sm font-medium text-ink hover:border-ink"
      >
        <LogOut className="size-4" aria-hidden="true" />
        Logout
      </button>
    </header>
  )
}
