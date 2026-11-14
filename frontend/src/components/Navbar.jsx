import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Brand from './Brand'
import { getStudent, logout } from '../services/api'

// "Ravirala Rohith" -> "RR"
function initialsOf(name = '') {
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase())
  return letters.join('') || '?'
}

// Top bar, like the UMS header: logo on the left, the logged-in student on the right.
export default function Navbar() {
  const navigate = useNavigate()
  const student = getStudent()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 md:h-[72px]">
        <Brand />

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <p className="font-semibold text-ink">{student?.name}</p>
            <p className="mt-0.5 text-xs text-muted">
              Reg. No. {student?.registrationNumber}
              {student?.program ? ` | ${student.program}` : ''}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-full bg-flame-wash text-sm font-bold text-flame-deep ring-2 ring-saffron/60"
          >
            {initialsOf(student?.name)}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line-strong px-3 text-sm font-medium text-ink hover:border-flame hover:text-flame-deep"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
