import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppWindow, ArrowRight, ArrowUpRight, ShieldCheck, Smartphone } from 'lucide-react'
import PortalMark from '../components/PortalMark'
import TabCard from '../components/TabCard'
import { addressLabel, countTasks, hostOf, openLabel } from '../lib/portal'
import { getErrorMessage, getTasks } from '../services/api'

export default function Portals() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getTasks()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold sm:text-[40px]">Your portals</h1>
      <p className="mt-3 max-w-3xl text-lg text-muted">
        LPU work is spread over five official portals. Open one directly, or see every task you can do there.
      </p>

      {!data && !error && <p className="mt-10 text-muted">Loading portals…</p>}
      {error && (
        <p role="alert" className="mt-10 rounded-xl bg-danger-wash px-4 py-3 text-danger">
          {error}
        </p>
      )}

      <div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
        {data?.portals.map((portal) => {
          const count = countTasks(data.tasks, portal.slug)
          return (
            <TabCard key={portal.slug} title={portal.name} icon={portal.type === 'Mobile App' ? Smartphone : AppWindow} className="flex flex-col">
              <div className="flex flex-1 flex-col px-5 pb-5">
                <div className="flex items-start gap-4">
                  <PortalMark portal={portal} size="lg" />
                  <p className="text-charcoal">{portal.description}</p>
                </div>

                <p className="mt-4 flex flex-wrap items-center gap-1.5 text-sm text-muted">
                  <ShieldCheck className="size-4 text-leaf" aria-hidden="true" />
                  {addressLabel(portal)} <span className="font-semibold text-charcoal">{hostOf(portal.url)}</span>
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-flame px-4 text-sm font-semibold text-white hover:bg-flame-deep"
                  >
                    {openLabel(portal)} <ArrowUpRight className="size-4" aria-hidden="true" />
                    <span className="sr-only">(new tab)</span>
                  </a>
                  <Link
                    to={`/?portal=${portal.slug}`}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line-strong px-4 text-sm font-semibold text-charcoal hover:border-blue hover:text-blue"
                  >
                    {count} {count === 1 ? 'task' : 'tasks'} <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
                {portal.alternateUrl && (
                  <a
                    href={portal.alternateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-sm font-semibold text-blue hover:underline"
                  >
                    Also on the {portal.alternateLabel} ↗
                  </a>
                )}
              </div>
            </TabCard>
          )
        })}
      </div>
    </div>
  )
}
