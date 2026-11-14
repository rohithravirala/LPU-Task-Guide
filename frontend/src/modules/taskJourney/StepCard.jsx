import { ArrowUpRight, Check, MapPin, TriangleAlert } from 'lucide-react'

// One step of the guide: what to do, where to go, and a button to tick it.
// `portalId` is the task's own portal: steps there only get an "Open" button,
// steps somewhere else (an office) get a "Where" box explaining the place.
export default function StepCard({ step, portalId, isDone, isCurrent, onToggle }) {
  const isOnTaskPortal = step.service && step.service._id === portalId

  // A finished step is shown as one short line, so the page stays clean
  if (isDone) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-leaf/20 bg-leaf-wash px-5 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-leaf text-white">
          <Check className="size-5" aria-hidden="true" />
        </span>
        <p className="flex-1 font-semibold text-ink">
          Step {step.order}: {step.title} <span className="font-normal text-muted">· done</span>
        </p>
        <button type="button" onClick={onToggle} className="text-sm font-semibold text-ink underline underline-offset-4">
          Undo<span className="sr-only"> step {step.order}</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border-2 bg-surface p-5 sm:p-6 ${isCurrent ? 'border-flame shadow-lg shadow-flame/10' : 'border-line'}`}>
      <div className="flex items-start gap-4">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full font-bold ${
            isCurrent ? 'bg-flame text-white' : 'bg-paper text-ink ring-1 ring-line-strong'
          }`}
        >
          {step.order}
        </span>
        <div className="min-w-0 flex-1">
          {isCurrent && (
            <p className="mb-1.5 inline-block rounded-md bg-flame-wash px-2 py-0.5 text-sm font-semibold text-flame-deep">
              Do this now
            </p>
          )}
          <h3 className="text-lg font-bold">
            {step.title}
            {step.isOptional && <span className="font-normal text-muted"> (optional)</span>}
          </h3>

          <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-flame">
            {step.instructions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          {step.note && (
            <p className="mt-4 flex gap-2 rounded-lg bg-flame-wash px-3 py-2 text-sm text-flame-deep">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {step.note}
            </p>
          )}

          {/* A step somewhere else: where the student goes, and what that place is */}
          {step.service && !isOnTaskPortal && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3">
              <p className="flex items-start gap-2">
                <MapPin className="mt-1 size-4 shrink-0 text-muted" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-ink">Where: {step.service.name}</span>
                  <span className="block text-sm text-muted">{step.service.description}</span>
                </span>
              </p>
              {step.openUrl && (
                <a
                  href={step.openUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-blue px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-deep"
                >
                  Open {step.service.name} <ArrowUpRight className="size-4" aria-hidden="true" />
                  <span className="sr-only">(new tab)</span>
                </a>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {/* A step on the task's own portal: just a button to open it, next to the tick button */}
            {isOnTaskPortal && step.openUrl && (
              <a
                href={step.openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-blue px-4 font-semibold text-white hover:bg-blue-deep"
              >
                Open {step.service.name} <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only">(new tab)</span>
              </a>
            )}
            <button
              type="button"
              onClick={onToggle}
              className={`inline-flex h-11 items-center gap-2 rounded-lg px-5 font-semibold ${
                isCurrent ? 'bg-flame text-white hover:bg-flame-deep' : 'border border-line-strong text-ink hover:border-flame hover:text-flame-deep'
              }`}
            >
              <Check className="size-4" aria-hidden="true" /> I have done this step
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
