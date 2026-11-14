import { useEffect, useRef } from 'react'
import { Check, Info } from 'lucide-react'
import { Tag } from '../../../components/ui/Tag'
import { Notice } from '../../../components/ui/StatusMessage'
import { stationNumber } from '../../../utils/formatDate'
import ServiceInfo from './ServiceInfo'

/**
 * The step currently shown on the journey (Task 17): what to do, which service is
 * responsible, prerequisites, notes, and the completion checklist (children).
 * Render with key={step._id}; when the student moves between steps, focus moves
 * to the new step's heading so keyboard and screen-reader users follow along.
 */
export default function JourneyStep({ step, index, total, taskId, isComplete, isCurrent, moveFocus, children }) {
  const headingRef = useRef(null)

  useEffect(() => {
    if (!moveFocus) return
    headingRef.current?.focus({ preventScroll: true })
    // Only scroll when the new step starts out of view (typically on mobile), so the
    // progress strip stays visible on larger screens.
    const section = headingRef.current?.closest('section')
    const top = section?.getBoundingClientRect().top ?? 0
    if (top < 72 || top > window.innerHeight * 0.6) section?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [moveFocus])

  return (
    <section aria-labelledby={`step-title-${step._id}`} className="border border-line bg-paper">
      <header className="border-b border-line px-5 py-5 sm:px-6">
        <p className="label-mono flex flex-wrap items-center gap-2 text-stone-deep">
          <span className="text-vermilion-deep">
            Step {stationNumber(index + 1)} of {stationNumber(total)}
          </span>
          <span aria-hidden="true">·</span>
          {step.isRequired ? 'Required' : 'Optional'}
          {isCurrent && <Tag tone="vermilion">You are here</Tag>}
          {isComplete && (
            <Tag tone="chartreuse" icon={Check}>
              Done
            </Tag>
          )}
        </p>
        <h2 ref={headingRef} tabIndex={-1} id={`step-title-${step._id}`} className="mt-2 text-2xl leading-tight font-semibold outline-none sm:text-[26px]">
          {step.title}
        </h2>
        {step.description && <p className="mt-1.5 text-[15px] leading-relaxed text-stone-deep">{step.description}</p>}
      </header>

      <div className="space-y-7 px-5 py-6 sm:px-6">
        {step.service ? (
          <ServiceInfo service={step.service} currentTaskId={taskId} />
        ) : (
          <p className="flex items-center gap-2 text-sm text-stone-deep">
            <Info className="size-4" aria-hidden="true" />
            No specific university service is needed for this step.
          </p>
        )}

        {step.prerequisites?.length > 0 && (
          <div>
            <h3 className="label-mono text-stone-deep">Before this step</h3>
            <ul className="mt-2.5 space-y-1.5">
              {step.prerequisites.map((item) => (
                <li key={item} className="flex gap-2.5 text-[15px] text-charcoal">
                  <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 bg-ink" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {step.instructions?.length > 0 && (
          <div>
            <h3 className="label-mono text-stone-deep">What to do</h3>
            <ol className="mt-3 space-y-3">
              {step.instructions.map((instruction, i) => (
                <li key={instruction} className="flex gap-3">
                  <span className="num-mono w-6 shrink-0 pt-0.5 text-[13px] font-medium text-stone">{i + 1}.</span>
                  <span className="text-[15px] leading-relaxed text-charcoal">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {step.additionalNotes && (
          <Notice tone="info" title="Note">
            {step.additionalNotes}
          </Notice>
        )}

        {children}
      </div>
    </section>
  )
}
