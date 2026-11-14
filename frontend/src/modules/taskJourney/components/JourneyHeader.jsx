import { Link } from 'react-router-dom'
import { ArrowLeft, CircleAlert, CircleCheck, LoaderCircle, RotateCcw } from 'lucide-react'
import { CategoryCode } from '../../../components/ui/Tag'
import { ServiceTypeIcon } from '../../../components/ui/ServiceTypeIcon'
import JourneyProgress from './JourneyProgress'

function SaveIndicator({ saveState, storage, onRetry }) {
  if (saveState === 'saving') {
    return (
      <span role="status" className="inline-flex items-center gap-1.5 text-[13px] text-stone-deep">
        <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> Saving…
      </span>
    )
  }
  if (saveState === 'error') {
    return (
      <span role="alert" className="inline-flex items-center gap-2 text-[13px] text-vermilion-deep">
        <CircleAlert className="size-3.5" aria-hidden="true" /> Progress not saved
        <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">
          Retry
        </button>
      </span>
    )
  }
  const where = storage === 'account' ? 'to your account' : 'on this device'
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[13px] text-stone-deep"
      title={
        storage === 'account'
          ? 'Your progress is saved to your account.'
          : 'Your progress is stored in this browser. Account sync arrives with the progress module.'
      }
    >
      <CircleCheck className="size-3.5 text-ink" aria-hidden="true" /> Progress saved {where}
    </span>
  )
}

/** Journey overview (Task 16): task, progress strip, services on the route, save state. */
export default function JourneyHeader({ task, services, steps, completedIds, progress, saveState, storage, onRetrySave, onReset }) {
  return (
    <header className="border-b border-line pb-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/tasks/${task.slug}`}
          className="inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-stone-deep hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Task details
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <SaveIndicator saveState={saveState} storage={storage} onRetry={onRetrySave} />
          {progress.completed > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-[13px] text-stone-deep hover:text-ink"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" /> Start over
            </button>
          )}
        </div>
      </div>

      <p className="label-mono mt-6 flex items-center gap-2 text-stone-deep">
        <CategoryCode code={task.category?.code} />
        <span>{task.category?.name}</span>
        <span aria-hidden="true">·</span>
        <span>Guided journey</span>
      </p>
      <h1 className="mt-3 text-[28px] leading-tight font-semibold sm:text-[34px]">{task.title}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-end lg:gap-10">
        <JourneyProgress steps={steps} completedIds={completedIds} progress={progress} />
        {services.length > 0 && (
          <div>
            <p className="label-mono text-stone-deep">Services on this route</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {services.map((service) => (
                <li
                  key={service._id}
                  className="inline-flex h-7 items-center gap-1.5 rounded-xs border border-line-strong bg-surface px-2 text-[13px] text-ink"
                >
                  <ServiceTypeIcon type={service.serviceType} className="size-3.5" />
                  {service.name}
                  {service.stepCount > 0 && <span className="num-mono text-[11px] text-stone">×{service.stepCount}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
