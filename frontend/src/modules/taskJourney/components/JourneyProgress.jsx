import { stationNumber } from '../../../utils/formatDate'

function statusLine(progress) {
  if (progress.status === 'completed') return 'Every required step is done.'
  if (progress.status === 'not_started') return 'Not started yet. Begin with step 01.'
  const left = progress.requiredRemaining
  return `${left} required step${left === 1 ? '' : 's'} to go.`
}

/**
 * Progress Strip (Task 18): one segment per step. Chartreuse = done,
 * vermilion = you are here, dashed = optional. Updates the moment a step changes.
 */
export default function JourneyProgress({ steps, completedIds, progress }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <p className="text-sm text-charcoal">
          <span className="num-mono font-semibold text-ink">
            {stationNumber(progress.requiredCompleted)}/{stationNumber(progress.required || progress.total)}
          </span>{' '}
          {progress.required ? 'required steps done' : 'steps done'}
          {progress.optional > 0 && progress.required > 0 && (
            <span className="text-stone-deep">
              {' '}
              · {progress.optionalCompleted}/{progress.optional} optional
            </span>
          )}
        </p>
        <p className="num-mono text-[26px] leading-none font-medium text-ink">{progress.percent}%</p>
      </div>

      <div
        role="progressbar"
        aria-label="Journey progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
        aria-valuetext={`${progress.requiredCompleted} of ${progress.required || progress.total} required steps complete`}
        className="mt-2.5 flex gap-1"
      >
        {steps.map((step, index) => {
          const done = completedIds.has(step._id)
          const current = index === progress.currentIndex
          const style = done
            ? 'bg-chartreuse ring-1 ring-inset ring-ink/25'
            : current
              ? 'bg-vermilion'
              : step.isRequired
                ? 'bg-line'
                : 'border border-dashed border-line-strong'
          return <span key={step._id} className={`h-2.5 flex-1 rounded-xs transition-colors duration-300 ${style}`} />
        })}
      </div>
      <p className="mt-2 text-[13px] text-stone-deep" aria-live="polite">
        {statusLine(progress)}
      </p>
    </div>
  )
}
