import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import TaskCard from './TaskCard'
import { getErrorMessage, getTasks } from '../../services/api'

// Search box + all tasks, grouped under their category (e.g. "Examinations").
export default function TaskList() {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [searchText, setSearchText] = useState('') // what the student is typing
  const [search, setSearch] = useState('') // what was actually searched
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [error, setError] = useState('')

  // Load tasks when the page opens and every time a new search is made
  useEffect(() => {
    let ignore = false // ignore an old answer if a newer search was started
    getTasks(search)
      .then((data) => {
        if (ignore) return
        setTasks(data.tasks)
        setCategories(data.categories)
        setStatus('ready')
      })
      .catch((err) => {
        if (ignore) return
        setError(getErrorMessage(err))
        setStatus('error')
      })
    return () => {
      ignore = true
    }
  }, [search])

  function runSearch(text) {
    if (text === search) return
    setStatus('loading')
    setSearch(text)
  }

  function handleSearch(event) {
    event.preventDefault()
    runSearch(searchText.trim())
  }

  function clearSearch() {
    setSearchText('')
    runSearch('')
  }

  // Put the tasks under their category heading, in category order
  const groups = categories
    .map((category) => ({ category, tasks: tasks.filter((task) => task.category === category) }))
    .filter((group) => group.tasks.length > 0)

  return (
    <section className="mt-8">
      <form onSubmit={handleSearch} className="flex max-w-2xl gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-stone-deep" aria-hidden="true" />
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search: exam fine, attendance, fees…"
            aria-label="Search tasks"
            className="h-12 w-full rounded-lg border border-line-strong bg-surface pr-4 pl-12 text-base focus:border-ink focus:outline-none"
          />
        </div>
        <button type="submit" className="h-12 rounded-lg bg-ink px-6 font-semibold text-paper hover:bg-ink-deep">
          Search
        </button>
      </form>

      {search && status === 'ready' && (
        <p className="mt-4 text-stone-deep">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} found for "{search}" ·{' '}
          <button type="button" onClick={clearSearch} className="font-semibold text-ink underline underline-offset-4">
            Show all tasks
          </button>
        </p>
      )}

      {status === 'loading' && <p className="mt-8 text-stone-deep">Loading tasks…</p>}

      {status === 'error' && (
        <p role="alert" className="mt-8 rounded-lg bg-vermilion-wash px-4 py-3 text-vermilion-deep">
          {error}
        </p>
      )}

      {status === 'ready' && tasks.length === 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-line-strong bg-surface p-6">
          <p className="font-semibold text-ink">No task found for "{search}".</p>
          <p className="mt-1 text-stone-deep">Try a simpler word, like "fee", "exam" or "certificate".</p>
        </div>
      )}

      {status === 'ready' &&
        groups.map((group) => (
          <section key={group.category} className="mt-10">
            <h2 className="text-xl font-bold">{group.category}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {group.tasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          </section>
        ))}
    </section>
  )
}
