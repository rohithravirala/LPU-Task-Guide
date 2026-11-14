import { ArrowLeft, Search } from 'lucide-react'
import { Wordmark } from '../components/ui/Wordmark'
import { ButtonLink } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-paper bg-survey px-4 py-8 sm:px-10">
      <Wordmark />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
        <p className="label-mono text-vermilion-deep">Error 404 · Off the map</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Wrong turn.</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-stone-deep">
          This page is not on any route we know. Head back and search for the task you were trying to do.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to={isAuthenticated ? '/dashboard' : '/'} icon={ArrowLeft}>
            {isAuthenticated ? 'Back to dashboard' : 'Back to home'}
          </ButtonLink>
          {isAuthenticated && (
            <ButtonLink to="/tasks" variant="secondary" icon={Search}>
              Search tasks
            </ButtonLink>
          )}
        </div>
      </main>
    </div>
  )
}
