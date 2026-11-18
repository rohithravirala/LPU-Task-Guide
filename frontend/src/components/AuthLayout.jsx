import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Search, Signpost } from 'lucide-react'
import lpuSeal from '../assets/lpu-seal.svg'
import PortalMark from './PortalMark'
import { getTasks } from '../services/api'
import { countTasks } from '../lib/portal'

const whatItDoes = [
  { icon: Search, text: 'Find any LPU task in one search: attendance, fees, hostel leave, CodeTantra tests…' },
  { icon: Signpost, text: 'See exactly where to click, like UMS › Academics › View Attendance.' },
  { icon: ArrowUpRight, text: 'Open the right portal in one click, or follow the step-by-step guide.' },
]

const fallbackPortals = [
  { slug: 'ums', shortName: 'UMS', name: 'UMS' },
  { slug: 'lpu-live', shortName: 'Live', name: 'LPU Live' },
  { slug: 'codetantra', shortName: 'CT', name: 'CodeTantra' },
  { slug: 'neocolab', shortName: 'Neo', name: 'NeoColab' },
  { slug: 'lpu-touch', shortName: 'Touch', name: 'LPU Touch' },
]

export default function AuthLayout({ title, subtitle, children }) {
  const [overview, setOverview] = useState({ total: 0, portals: fallbackPortals })

  useEffect(() => {
    getTasks()
      .then(({ tasks, portals }) => {
        setOverview({
          total: tasks.length,
          portals: portals.map((portal) => ({ ...portal, count: countTasks(tasks, portal.slug) })),
        })
      })
      .catch(() => {})
  }, [])

  const { total, portals } = overview

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy sm:p-6 lg:p-10">
      <div className="grid min-h-screen w-full max-w-6xl overflow-hidden bg-night sm:min-h-[min(780px,calc(100vh-3rem))] sm:rounded-[28px] sm:shadow-2xl sm:shadow-black/40 lg:grid-cols-[1.08fr_1fr]">
        <section
          className="relative hidden flex-col justify-between gap-8 p-10 lg:flex xl:p-12"
          style={{ background: 'linear-gradient(165deg, var(--color-ember-deep) 8%, #2f1107 55%, var(--color-ember) 100%)' }}
        >
          <div className="flex items-center gap-3.5">
            <img src={lpuSeal} alt="Lovely Professional University" width="56" height="56" className="size-14 object-contain" />
            <span className="font-brand text-[22px] font-extrabold tracking-[0.02em] text-white">LPU TASK GUIDE</span>
          </div>

          <div className="mx-auto w-full max-w-md">
            <p className="text-xs font-semibold tracking-[0.2em] text-apricot uppercase">What it does</p>
            <h2 className="mt-2 text-[28px] leading-tight font-bold text-white">Every LPU task, one guided path</h2>
            <ul className="mt-5 space-y-3.5">
              {whatItDoes.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-[15px] leading-snug text-white/85">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-apricot">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="pt-1">{text}</span>
                </li>
              ))}
            </ul>

            <p className="mt-9 text-xs font-semibold tracking-[0.2em] text-apricot uppercase">
              Connected to {portals.length} LPU portals{total ? ` · ${total} tasks` : ''}
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {portals.map((portal) => (
                <li key={portal.slug} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-2.5 py-2">
                  <PortalMark portal={portal} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{portal.name}</span>
                    {portal.count > 0 && <span className="block text-xs text-white/60">{portal.count} tasks</span>}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              to="/explore"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg border border-white/25 px-4 font-semibold text-white hover:border-apricot hover:text-apricot"
            >
              Browse all tasks without signing in <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <p className="text-sm text-white/60">A student guidance project. Not an official LPU website.</p>
        </section>

        <main className="flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <img src={lpuSeal} alt="Lovely Professional University" width="44" height="44" className="size-11 object-contain" />
              <span className="font-brand text-lg font-extrabold tracking-[0.02em] text-white">LPU TASK GUIDE</span>
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-[44px]">{title}</h1>
            <p className="mt-3 text-lg text-fog">{subtitle}</p>
            {children}

            <div className="mt-10 rounded-xl border border-navy-line p-4 lg:hidden">
              <p className="text-sm text-fog">
                LPU Task Guide puts every task from {portals.map((portal) => portal.name).join(', ')} in one place and opens the
                right portal for you.
              </p>
              <Link to="/explore" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-apricot hover:underline">
                Browse {total || 'all'} tasks without signing in <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
