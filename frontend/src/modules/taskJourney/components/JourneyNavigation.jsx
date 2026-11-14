import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { stationNumber } from '../../../utils/formatDate'

/**
 * Previous / next navigation (Task 20).
 * Desktop: inline buttons naming the neighbouring steps.
 * Mobile: a fixed bottom bar with the step's main action in thumb reach.
 */
export default function JourneyNavigation({ steps, activeIndex, isComplete, onPrevious, onNext, onComplete }) {
  const previous = steps[activeIndex - 1]
  const next = steps[activeIndex + 1]

  return (
    <>
      <nav aria-label="Step navigation" className="hidden items-stretch justify-between gap-4 sm:flex">
        {previous ? (
          <button
            type="button"
            onClick={onPrevious}
            className="group flex max-w-[48%] items-center gap-3 rounded-sm border border-line px-4 py-3 text-left hover:border-ink hover:bg-surface"
          >
            <ArrowLeft className="size-4 shrink-0 text-stone-deep group-hover:text-ink" aria-hidden="true" />
            <span className="min-w-0">
              <span className="label-mono block text-stone">Previous · {stationNumber(activeIndex)}</span>
              <span className="block truncate text-sm font-medium text-ink">{previous.title}</span>
            </span>
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button
            type="button"
            onClick={onNext}
            className="group ml-auto flex max-w-[48%] items-center gap-3 rounded-sm border border-line px-4 py-3 text-right hover:border-ink hover:bg-surface"
          >
            <span className="min-w-0">
              <span className="label-mono block text-stone">Next · {stationNumber(activeIndex + 2)}</span>
              <span className="block truncate text-sm font-medium text-ink">{next.title}</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-stone-deep group-hover:text-ink" aria-hidden="true" />
          </button>
        )}
      </nav>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper px-4 py-3 sm:hidden">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" icon={ChevronLeft} onClick={onPrevious} disabled={!previous} aria-label="Previous step" />
          {isComplete ? (
            next ? (
              <Button className="flex-1" iconRight={ArrowRight} onClick={onNext}>
                Next step
              </Button>
            ) : (
              <p className="flex h-10 flex-1 items-center justify-center gap-2 text-sm font-medium text-ink">
                <Check className="size-4" aria-hidden="true" /> Last step done
              </p>
            )
          ) : (
            <Button className="flex-1" variant="accent" icon={Check} onClick={onComplete}>
              Mark complete
            </Button>
          )}
          <Button variant="secondary" size="icon" icon={ChevronRight} onClick={onNext} disabled={!next} aria-label="Next step" />
        </div>
        <p className="num-mono mt-1.5 text-center text-[11px] text-stone-deep">
          Step {stationNumber(activeIndex + 1)} of {stationNumber(steps.length)}
        </p>
      </div>
    </>
  )
}
