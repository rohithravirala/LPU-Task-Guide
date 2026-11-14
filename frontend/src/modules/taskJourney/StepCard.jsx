import { ArrowUpRight, Check, MapPin, TriangleAlert } from 'lucide-react'

// One step of the guide: what to do, where to go, and a button to tick it.
export default function StepCard({ step, isDone, isCurrent, onToggle }) {
  // A finished step is shown as one short line, so the page stays clean
  if (isDone) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-line bg-chartreuse-wash px-5 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
          <Check className="size-5" aria-hidden="true" />
        </span>
        <p className="flex-1 font-semibold text-ink">
          Step {step.order}: {step.title} <span className="font-normal text-stone-deep">· done</span>
        </p>
        <button type="button" onClick={onToggle} className="text-sm font-semibold text-ink underline underline-offset-4">
          Undo
        </button>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border-2 bg-surface p-6 ${isCurrent ? 'border-vermilion' : 'border-line'}`}>
      <div className="flex items-start gap-4">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full font-bold ${
            isCurrent ? 'bg-vermilion text-white' : 'bg-paper text-ink'
          }`}
        >
          {step.order}
        </span>
        <div className="min-w-0 flex-1">
          {isCurrent && (
            <p className="mb-1 inline-block rounded-md bg-vermilion-wash px-2 py-0.5 text-sm font-semibold text-vermilion-deep">
              Do this now
            </p>
          )}
          <h3 className="text-lg font-bold">
            {step.title}
            {step.isOptional && <span className="font-normal text-stone-deep"> (optional)</span>}
          </h3>

          <p className="mt-3 text-sm font-semibold text-ink">What to do</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {step.instructions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          {step.note && (
            <p className="mt-4 flex gap-2 rounded-lg bg-vermilion-wash px-3 py-2 text-sm text-vermilion-deep">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {step.note}
            </p>
          )}

          {/* Where the student goes for this step */}
          {step.service && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-paper px-4 py-3">
              <p className="flex items-start gap-2">
                <MapPin className="mt-1 size-4 shrink-0 text-stone-deep" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-ink">Where: {step.service.name}</span>
                  <span className="block text-sm text-stone-deep">{step.service.description}</span>
                </span>
              </p>
              {step.service.url && (
                <a
                  href={step.service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-ink px-3 py-1.5 text-sm font-semibold text-ink hover:bg-ink hover:text-paper"
                >
                  Open {step.service.name} <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onToggle}
            className={`mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold ${
              isCurrent ? 'bg-ink text-paper hover:bg-ink-deep' : 'border border-line-strong text-ink hover:border-ink'
            }`}
          >
            <Check className="size-4" aria-hidden="true" /> I have done this step
          </button>
        </div>
      </div>
    </div>
  )
}
