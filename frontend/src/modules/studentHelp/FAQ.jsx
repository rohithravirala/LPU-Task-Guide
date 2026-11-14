import { useEffect, useState } from 'react'
import { ChevronDown, CircleHelp, Search } from 'lucide-react'
import TabCard from '../../components/TabCard'
import { getErrorMessage, getFaqs } from '../../services/api'

// List of questions and answers, in an orange-label card.
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
    <TabCard title={title} icon={CircleHelp} count={status === 'ready' ? faqs.length : undefined}>
      <div className="px-5 pb-5">
        {!taskId && (
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search: login, payment, CodeTantra…"
                aria-label="Search questions"
                className="h-11 w-full rounded-xl border border-line-strong bg-paper pr-4 pl-11 focus:border-flame focus:bg-surface focus:ring-2 focus:ring-flame/20 focus:outline-none"
              />
            </div>
            <button type="submit" className="h-11 rounded-xl bg-flame px-5 font-semibold text-white hover:bg-flame-deep">
              Search
            </button>
          </form>
        )}

        <div className={taskId ? '' : 'mt-4'}>
          {status === 'loading' && <p className="text-muted">Loading…</p>}
          {status === 'error' && <p role="alert" className="rounded-xl bg-danger-wash px-4 py-3 text-danger">{error}</p>}
          {status === 'ready' && faqs.length === 0 && <p className="text-muted">No questions found for “{search}”.</p>}

          {status === 'ready' && faqs.length > 0 && (
            <div className="divide-y divide-line rounded-xl border border-line">
              {faqs.map((faq) => (
                // <details> is a built-in HTML accordion: click the question to see the answer
                <details key={faq._id} className="group px-4 py-3.5 open:bg-flame-wash/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-2 text-charcoal">{faq.answer}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </TabCard>
  )
}
