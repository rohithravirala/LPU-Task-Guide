import { Check } from 'lucide-react'
import { Tag } from '../../../components/ui/Tag'
import { stationNumber } from '../../../utils/formatDate'

function stateOf(step, index, completedIds, currentIndex) {
  if (completedIds.has(step._id)) return 'done'
  if (index === currentIndex) return 'current'
  return 'upcoming'
}

/** A numbered transit station. */
function Station({ state, optional, number, small = false }) {
  const size = small ? 'size-6 text-[10px]' : 'size-7 text-[11px]'
  const look =
    state === 'done'
      ? 'bg-ink text-paper'
      : state === 'current'
        ? 'bg-vermilion text-white ring-4 ring-vermilion/20'
        : `bg-surface text-stone-deep border-2 ${optional ? 'border-dashed' : ''} border-line-strong`
  return (
    <span className={`num-mono relative flex shrink-0 items-center justify-center rounded-full font-semibold ${size} ${look}`}>
      {state === 'done' ? <Check className={small ? 'size-3' : 'size-3.5'} strokeWidth={3} aria-hidden="true" /> : stationNumber(number)}
    </span>
  )
}

function stateLabel(state, optional) {
  if (state === 'done') return 'completed'
  if (state === 'current') return 'you are here'
  return optional ? 'optional, not started' : 'not started'
}

/**
 * Journey Rail (Task 17): the ordered steps as a transit line. The travelled part
 * of the line is solid ink, the road ahead is dashed. Selecting a station shows
 * that step; it does not change progress.
 */
export default function JourneyStepList({ steps, completedIds, currentIndex, activeIndex, onSelect, orientation = 'vertical' }) {
  if (orientation === 'horizontal') {
    return (
      <nav aria-label="Journey steps">
        <ol className="flex items-center overflow-x-auto px-1 py-2">
          {steps.map((step, index) => {
            const state = stateOf(step, index, completedIds, currentIndex)
            const active = index === activeIndex
            return (
              <li key={step._id} className={`flex min-w-0 items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-current={state === 'current' ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${step.title} (${stateLabel(state, !step.isRequired)})`}
                  className={`shrink-0 rounded-full ${active ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper' : ''}`}
                >
                  <Station state={state} optional={!step.isRequired} number={step.order} small />
                </button>
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`mx-1 h-0 min-w-3 flex-1 border-t-2 ${state === 'done' ? 'border-ink' : 'border-dashed border-line-strong'}`}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }

  return (
    <nav aria-label="Journey steps">
      <ol>
        {steps.map((step, index) => {
          const state = stateOf(step, index, completedIds, currentIndex)
          const active = index === activeIndex
          return (
            <li key={step._id} className="relative pb-2 last:pb-0">
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-10 bottom-0 left-[19px] ${state === 'done' ? 'w-0.5 bg-ink' : 'border-l-2 border-dashed border-line-strong'}`}
                />
              )}
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={state === 'current' ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${step.title} (${stateLabel(state, !step.isRequired)})${active ? ', showing' : ''}`}
                className={`relative flex w-full items-start gap-3 rounded-sm p-1.5 pr-3 text-left transition-colors ${
                  active ? 'bg-surface ring-1 ring-line-strong' : 'hover:bg-surface/70'
                }`}
              >
                <Station state={state} optional={!step.isRequired} number={step.order} />
                <span className="min-w-0 pt-1">
                  <span
                    className={`block text-sm leading-snug ${
                      state === 'current' ? 'font-semibold text-ink' : state === 'done' ? 'text-stone-deep' : 'text-charcoal'
                    }`}
                  >
                    {step.title}
                  </span>
                  {(state !== 'upcoming' || !step.isRequired) && (
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {state === 'current' && <Tag tone="vermilion">You are here</Tag>}
                      {state === 'done' && <span className="label-mono text-stone">Done</span>}
                      {!step.isRequired && state !== 'done' && <Tag>Optional</Tag>}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
