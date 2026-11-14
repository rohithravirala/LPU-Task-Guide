import { useState } from 'react'
import { Check, CircleCheck, SkipForward, Undo2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/Field'

/**
 * Interactive checklist (Task 19). The "Done when" items are a self-check that
 * helps the student confirm the step; "Mark complete" is what records progress.
 * Render with key={step._id} so ticks reset for each step.
 */
export default function JourneyChecklist({ step, isComplete, isLastStep, onComplete, onUndo, onSkip }) {
  const [ticked, setTicked] = useState(() => new Set())
  const items = step.checklist ?? []
  const allTicked = items.length > 0 && ticked.size === items.length

  const toggle = (index) =>
    setTicked((previous) => {
      const next = new Set(previous)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  return (
    <section
      aria-labelledby={`checklist-${step._id}`}
      className={`border transition-colors ${isComplete ? 'border-chartreuse bg-chartreuse-wash/70' : 'border-ink/70 bg-surface'}`}
    >
      <div className="px-4 pt-4 pb-4 sm:px-5">
        <h3 id={`checklist-${step._id}`} className="label-mono text-stone-deep">
          {items.length ? 'Done when you can confirm' : 'Finish this step'}
        </h3>
        {items.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {items.map((item, index) => (
              <li key={item}>
                <Checkbox
                  id={`${step._id}-check-${index}`}
                  label={item}
                  checked={isComplete || ticked.has(index)}
                  disabled={isComplete}
                  onChange={() => toggle(index)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-stone-deep">Mark this step complete once you have followed the instructions above.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3 sm:px-5">
        {isComplete ? (
          <>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
              <CircleCheck className="size-5" aria-hidden="true" />
              Step completed
            </span>
            <Button variant="ghost" size="sm" icon={Undo2} onClick={onUndo}>
              Mark as not done
            </Button>
          </>
        ) : (
          <>
            <Button icon={Check} variant={allTicked || !items.length ? 'accent' : 'primary'} onClick={onComplete}>
              {isLastStep ? 'Mark step complete' : 'Mark complete and continue'}
            </Button>
            {!step.isRequired && (
              <Button variant="ghost" icon={SkipForward} onClick={onSkip}>
                Skip optional step
              </Button>
            )}
          </>
        )}
      </div>
    </section>
  )
}
