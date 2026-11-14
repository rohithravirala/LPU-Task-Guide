import { useState } from 'react'
import { Link } from 'react-router-dom'
import TaskSearch from './TaskSearch'
import { formatDate, greetingFor } from '../../../utils/formatDate'

/** Welcome + the main discovery action: search for what you need to do. */
export default function DashboardHeader({ name }) {
  const [today] = useState(() => new Date())
  const firstName = name?.split(' ')[0] ?? 'there'

  return (
    <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:items-end lg:gap-10">
      <div>
        <p className="label-mono text-stone-deep">{formatDate(today, 'EEEE · d MMMM yyyy')}</p>
        <h1 className="mt-2 text-[30px] leading-tight font-semibold sm:text-[38px]">
          {greetingFor(today)}, {firstName}.
        </h1>
        <p className="mt-2 text-[15px] text-stone-deep">What do you need to get done today?</p>
      </div>
      <div>
        <TaskSearch placeholder="Try “attendance”, “pay fees” or “exam schedule”" />
        <p className="mt-2.5 text-[13px] text-stone-deep">
          Not sure what it is called?{' '}
          <Link to="/tasks" className="font-medium text-ink underline underline-offset-4 hover:text-vermilion-deep">
            Browse the full catalogue
          </Link>
        </p>
      </div>
    </header>
  )
}
