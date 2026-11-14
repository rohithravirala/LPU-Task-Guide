import { useEffect, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { getErrorMessage, getFaqs } from '../../services/api'

// List of questions and answers.
//  - On the Help page: all FAQs with a search box.
//  - On a guide page (taskId given): only that task's FAQs, no search box.
export default function FAQ({ taskId = '', title }) {
  const [faqs, setFaqs] = useState([])
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    getFaqs({ search, taskId })
      .then((data) => {
        if (ignore) return
        setFaqs(data)
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
  }, [search, taskId])

  function handleSearch(event) {
    event.preventDefault()
    if (searchText.trim() === search) return
    setStatus('loading')
    setSearch(searchText.trim())
  }

  // A task with no FAQs shows nothing on its guide page
  if (taskId && status === 'ready' && faqs.length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-bold">{title}</h2>

      {!taskId && (
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone-deep" aria-hidden="true" />
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search: login, payment, attendance…"
              aria-label="Search questions"
              className="h-11 w-full rounded-lg border border-line-strong bg-surface pr-4 pl-11 focus:border-ink focus:outline-none"
            />
          </div>
          <button type="submit" className="h-11 rounded-lg bg-ink px-5 font-semibold text-paper hover:bg-ink-deep">
            Search
          </button>
        </form>
      )}

      <div className="mt-4">
        {status === 'loading' && <p className="text-stone-deep">Loading…</p>}
        {status === 'error' && <p role="alert" className="rounded-lg bg-vermilion-wash px-4 py-3 text-vermilion-deep">{error}</p>}
        {status === 'ready' && faqs.length === 0 && <p className="text-stone-deep">No questions found for "{search}".</p>}

        {status === 'ready' && faqs.length > 0 && (
          <div className="space-y-3">
            {faqs.map((faq) => (
              // <details> is a built-in HTML accordion: click the question to see the answer
              <details key={faq._id} className="group rounded-xl border border-line bg-surface px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                  {faq.question}
                  <ChevronDown className="size-5 shrink-0 text-stone-deep transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-3 text-charcoal">{faq.answer}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
