import { ArrowRight, Check, CornerDownLeft, Search } from 'lucide-react'
import { ButtonLink } from '../../../components/ui/Button'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { Skeleton } from '../../../components/Loader'
import { useAuth } from '../../../context/AuthContext'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { getServices } from '../../taskJourney/services/journeyService'
import { useCategories } from '../hooks/useTaskFilters'
import RouteMapGraphic from '../components/RouteMapGraphic'
import CataloguePreview from '../components/CataloguePreview'

const QUESTIONS = [
  { question: 'What do I want to do?', answer: 'Search or browse the task catalogue' },
  { question: 'Which university service should I use?', answer: 'Every task and step names its service' },
  { question: 'What do I need before starting?', answer: 'Requirements are listed up front' },
  { question: 'What steps should I follow?', answer: 'An ordered, numbered journey' },
  { question: 'Which step am I on?', answer: 'Your position is always marked' },
  { question: 'What if something goes wrong?', answer: 'Troubleshooting and FAQs' },
  { question: 'Where can I get more help?', answer: 'Help centre and support requests' },
]

const MODULES = [
  {
    number: '01',
    module: 'Task catalogue',
    title: 'Find the task, not the portal',
    text: 'Search in your own words, like “fine” or “marks”, or browse by category. Every task shows the service involved, how many steps it takes and what to prepare.',
  },
  {
    number: '02',
    module: 'Task journey',
    title: 'Follow one clear route',
    text: 'Each task becomes an ordered journey. Every step says which service is responsible, what to do there and how to know you are done. Your place is saved.',
  },
  {
    number: '03',
    module: 'Guidance and help',
    title: 'Get unstuck quickly',
    text: 'FAQs, troubleshooting guides, university notices and support requests, linked to the task you are working on.',
  },
]

function SearchPreview() {
  return (
    <div aria-hidden="true" className="border border-line bg-surface p-3">
      <div className="flex h-9 items-center gap-2 rounded-sm border border-ink/60 px-2.5 text-[13px] text-charcoal">
        <Search className="size-3.5 text-stone-deep" /> fine
      </div>
      <div className="mt-2 space-y-1.5">
        {['Check pending dues or fines', 'Pay your university fees'].map((title, index) => (
          <div key={title} className={`flex items-center gap-2 px-2 py-1.5 text-[12px] ${index === 0 ? 'bg-paper-deep' : ''}`}>
            <span className="num-mono border border-ink px-1 text-[10px] font-semibold">FIN</span>
            <span className="truncate text-ink">{title}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 border-t border-line px-2 pt-2 text-[11px] text-stone-deep">
          <CornerDownLeft className="size-3" /> Also searching: dues, penalty
        </div>
      </div>
    </div>
  )
}

function RailPreview() {
  const stops = [
    { label: 'Sign in to the portal', state: 'done' },
    { label: 'Open the attendance section', state: 'current' },
    { label: 'Review each course', state: 'next' },
  ]
  return (
    <ol aria-hidden="true" className="border border-line bg-surface p-4">
      {stops.map((stop, index) => (
        <li key={stop.label} className="relative flex items-center gap-3 pb-4 last:pb-0">
          {index < stops.length - 1 && (
            <span
              className={`absolute top-6 bottom-0 left-[11px] w-0.5 ${stop.state === 'done' ? 'bg-ink' : 'border-l-2 border-dashed border-line-strong bg-transparent'}`}
            />
          )}
          <span
            className={`num-mono relative flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
              stop.state === 'done'
                ? 'bg-ink text-paper'
                : stop.state === 'current'
                  ? 'bg-vermilion text-white ring-4 ring-vermilion/20'
                  : 'border-2 border-line-strong bg-surface text-stone-deep'
            }`}
          >
            {stop.state === 'done' ? <Check className="size-3" strokeWidth={3} /> : `0${index + 1}`}
          </span>
          <span className={`text-[12px] ${stop.state === 'current' ? 'font-semibold text-ink' : 'text-charcoal'}`}>{stop.label}</span>
        </li>
      ))}
    </ol>
  )
}

function HelpPreview() {
  return (
    <div aria-hidden="true" className="divide-y divide-line border border-line bg-surface text-[12px]">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="text-ink">Cannot sign in to the portal?</span>
        <span className="label-mono text-[10px] text-stone-deep">FAQ</span>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="text-ink">Page not loading</span>
        <span className="label-mono text-[10px] text-stone-deep">Guide</span>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="text-ink">Ticket #0142</span>
        <span className="label-mono border border-chartreuse bg-chartreuse-wash px-1 text-[10px] text-ink">In progress</span>
      </div>
    </div>
  )
}

const PREVIEWS = [SearchPreview, RailPreview, HelpPreview]

function HeroStats({ categoriesQuery, servicesQuery }) {
  const categories = categoriesQuery.data
  const totalTasks = categories?.reduce((sum, category) => sum + category.taskCount, 0)
  const stats = [
    { label: 'Guided tasks', value: totalTasks },
    { label: 'Categories', value: categories?.length },
    { label: 'Services mapped', value: servicesQuery.data?.length },
  ]
  if (categoriesQuery.error || servicesQuery.error) return null

  return (
    <dl className="mt-10 grid max-w-md grid-cols-3 gap-px border border-line bg-line">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col bg-paper px-4 py-3">
          <dt className="order-2 text-[12px] text-stone-deep">{stat.label}</dt>
          <dd className="num-mono order-1 text-2xl font-medium text-ink">
            {stat.value ?? <Skeleton className="my-1 h-6 w-8" />}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default function LandingPage() {
  useDocumentTitle(null)
  const { isAuthenticated } = useAuth()
  const categoriesQuery = useCategories()
  const servicesQuery = useApiQuery(({ signal }) => getServices({}, { signal }), [])

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-survey">
        <div className="mx-auto grid max-w-[76rem] items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:px-10 lg:py-20">
          <div>
            <p className="label-mono text-stone-deep">
              <span className="text-vermilion-deep">One student</span> · Seven portals · One guided path
            </p>
            <h1 className="mt-5 text-[40px] leading-[1.04] font-semibold sm:text-[54px] lg:text-[58px]">
              Your University Journey, Without the Confusion.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-stone-deep sm:text-lg">
              Find the right university service, understand every step, and keep track of your progress—all in one guided
              platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/tasks" size="lg" iconRight={ArrowRight}>
                Explore Tasks
              </ButtonLink>
              <a href="#how-it-works" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
                How It Works
              </a>
            </div>
            <HeroStats categoriesQuery={categoriesQuery} servicesQuery={servicesQuery} />
          </div>
          <RouteMapGraphic className="hidden md:block" />
        </div>
      </section>

      {/* The problem */}
      <section aria-labelledby="questions-title" className="border-b border-line">
        <div className="mx-auto grid max-w-[76rem] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:px-10 lg:py-20">
          <SectionHeader
            className="self-start lg:sticky lg:top-24"
            index="01"
            eyebrow="Why it exists"
            title={<span id="questions-title">The services exist. Finding your way through them is the hard part.</span>}
            description="LPU-Uni-Path does not replace any university portal. It answers the seven questions students ask before they can use one."
          />
          <ol className="grid gap-px border border-line bg-line sm:grid-cols-2">
            {QUESTIONS.map((item, index) => (
              <li key={item.question} className={`bg-paper p-5 ${index === QUESTIONS.length - 1 ? 'sm:col-span-2' : ''}`}>
                <p className="num-mono text-[12px] text-vermilion-deep">Q{index + 1}</p>
                <p className="mt-1.5 font-display text-[17px] font-semibold text-ink">{item.question}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-deep">
                  <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
                  {item.answer}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" aria-labelledby="how-title" className="border-b border-line bg-paper-deep/50">
        <div className="mx-auto max-w-[76rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <SectionHeader
            index="02"
            eyebrow="How it works"
            title={<span id="how-title">Three modules, one route from question to done</span>}
          />
          <ol className="relative mt-12 grid gap-12 lg:grid-cols-3 lg:gap-8">
            {/* Runs from the centre of station 01 to the centre of station 03 (3 columns, 2rem gaps). */}
            <span aria-hidden="true" className="absolute top-5 right-[calc(33.333%-2.583rem)] left-5 hidden h-0.5 bg-ink lg:block" />
            {MODULES.map((module, index) => {
              const Preview = PREVIEWS[index]
              return (
                <li key={module.number} className="relative">
                  <span className="num-mono relative flex size-10 items-center justify-center rounded-full border-[3px] border-ink bg-paper text-sm font-semibold text-ink">
                    {module.number}
                  </span>
                  <p className="label-mono mt-5 text-stone-deep">Module {index + 1} · {module.module}</p>
                  <h3 className="mt-2 text-xl font-semibold">{module.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-stone-deep">{module.text}</p>
                  <div className="mt-6">
                    <Preview />
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <CataloguePreview categoriesQuery={categoriesQuery} />

      {/* Final call to action */}
      <section className="bg-ink">
        <div className="mx-auto flex max-w-[76rem] flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div className="max-w-2xl">
            <p className="label-mono text-ink-mist">Ready when you are</p>
            <h2 className="mt-3 text-3xl font-semibold text-paper sm:text-4xl">Know exactly what to do next.</h2>
            <p className="mt-3 text-[15px] text-ink-mist">
              Create an account to open guided journeys, keep your place in each one and come back to tasks you opened.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAuthenticated ? (
              <ButtonLink to="/dashboard" variant="accent" size="lg" iconRight={ArrowRight}>
                Open your dashboard
              </ButtonLink>
            ) : (
              <>
                <ButtonLink to="/register" variant="accent" size="lg">
                  Create your account
                </ButtonLink>
                <ButtonLink to="/login" variant="onInk" size="lg">
                  Sign in
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
