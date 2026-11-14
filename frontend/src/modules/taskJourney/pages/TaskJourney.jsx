import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CircleDashed, Flag, RotateCcw, SearchX, Square } from 'lucide-react'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { Button, ButtonLink } from '../../../components/ui/Button'
import { EmptyState, ErrorState, Notice } from '../../../components/ui/StatusMessage'
import { Modal } from '../../../components/ui/Modal'
import { Skeleton } from '../../../components/Loader'
import JourneyHeader from '../components/JourneyHeader'
import JourneyStepList from '../components/JourneyStepList'
import JourneyStep from '../components/JourneyStep'
import JourneyChecklist from '../components/JourneyChecklist'
import JourneyNavigation from '../components/JourneyNavigation'
import { useJourney } from '../hooks/useJourney'

function JourneySkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading journey" className="space-y-6">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-2.5 w-full" />
      <div className="grid gap-8 pt-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}

function JourneyCompletion({ taskSlug }) {
  return (
    <section aria-live="polite" className="border border-chartreuse bg-chartreuse-wash p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Flag className="mt-0.5 size-5 shrink-0 text-ink" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-semibold">Route complete</h2>
          <p className="mt-1 text-[15px] text-charcoal">You have marked every required step of this journey as done.</p>
          <p className="mt-2 text-[13px] text-stone-deep">
            This is your own checklist. It does not confirm anything with the university, so check the responsible service
            if you need an official confirmation.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonLink to="/tasks" variant="secondary" size="sm">
          Find another task
        </ButtonLink>
        <ButtonLink to={`/tasks/${taskSlug}`} variant="ghost" size="sm">
          Back to task details
        </ButtonLink>
      </div>
    </section>
  )
}

/** Task Journey page (Tasks 16–22). */
export default function TaskJourney() {
  const { slug } = useParams()
  const journey = useJourney(slug)
  const [confirmReset, setConfirmReset] = useState(false)
  useDocumentTitle(journey.task ? `${journey.task.title} · Journey` : 'Journey')

  if (journey.loading && !journey.task) return <JourneySkeleton />

  if (journey.error) {
    return journey.error.isNotFound ? (
      <EmptyState
        icon={SearchX}
        title="This journey is not available"
        description="The task may have been removed. Search the catalogue for what you need to do."
        action={
          <ButtonLink to="/tasks" variant="secondary" size="sm">
            Go to the catalogue
          </ButtonLink>
        }
      />
    ) : (
      <ErrorState error={journey.error} onRetry={journey.refetch} />
    )
  }

  if (journey.loading) return <JourneySkeleton />

  const { task, steps, services, completedIds, progress, activeIndex, activeStep } = journey

  if (!steps.length || !activeStep) {
    return (
      <EmptyState
        title="This journey has no steps yet"
        description="The platform team has not added steps for this task."
        action={
          <ButtonLink to={`/tasks/${task.slug}`} variant="secondary" size="sm">
            Back to task details
          </ButtonLink>
        }
      />
    )
  }

  const activeDone = completedIds.has(activeStep._id)
  const isLastStep = activeIndex === steps.length - 1

  return (
    <div>
      <JourneyHeader
        task={task}
        services={services}
        steps={steps}
        completedIds={completedIds}
        progress={progress}
        saveState={journey.saveState}
        storage={journey.storage}
        onRetrySave={journey.retrySave}
        onReset={() => setConfirmReset(true)}
      />

      {journey.progressError && (
        <Notice tone="warning" className="mt-6">
          Your saved progress could not be loaded, so this journey starts from the beginning. {journey.progressError.message}
        </Notice>
      )}
      {task.verificationStatus !== 'verified' && (
        <Notice icon={CircleDashed} title="Illustrative guidance, not yet verified" className="mt-6">
          Confirm the details with the responsible service before acting on them.
        </Notice>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <p className="label-mono mb-3 text-stone-deep">Route · {steps.length} stations</p>
          <JourneyStepList
            steps={steps}
            completedIds={completedIds}
            currentIndex={progress.currentIndex}
            activeIndex={activeIndex}
            onSelect={journey.goTo}
          />
          {task.requirements?.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <p className="label-mono text-stone-deep">Have ready</p>
              <ul className="mt-3 space-y-2">
                {task.requirements.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-charcoal">
                    <Square className="mt-0.5 size-3.5 shrink-0 text-line-strong" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="border border-line bg-surface px-3 lg:hidden">
            <JourneyStepList
              orientation="horizontal"
              steps={steps}
              completedIds={completedIds}
              currentIndex={progress.currentIndex}
              activeIndex={activeIndex}
              onSelect={journey.goTo}
            />
          </div>

          {progress.status === 'completed' && <JourneyCompletion taskSlug={task.slug} />}

          <JourneyStep
            key={activeStep._id}
            step={activeStep}
            index={activeIndex}
            total={steps.length}
            taskId={task._id}
            isComplete={activeDone}
            isCurrent={activeIndex === progress.currentIndex}
            moveFocus={journey.hasNavigated}
          >
            <JourneyChecklist
              key={activeStep._id}
              step={activeStep}
              isComplete={activeDone}
              isLastStep={isLastStep}
              onComplete={() => journey.completeAndContinue(activeStep._id)}
              onUndo={() => journey.setStepComplete(activeStep._id, false)}
              onSkip={journey.goNext}
            />
          </JourneyStep>

          <JourneyNavigation
            steps={steps}
            activeIndex={activeIndex}
            isComplete={activeDone}
            onPrevious={journey.goPrevious}
            onNext={journey.goNext}
            onComplete={() => journey.completeAndContinue(activeStep._id)}
          />
        </div>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        size="sm"
        title="Start this journey again?"
        description="All steps will be marked as not done. You can't undo this."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Keep my progress
            </Button>
            <Button
              variant="dangerSolid"
              icon={RotateCcw}
              onClick={() => {
                journey.resetProgress()
                setConfirmReset(false)
              }}
            >
              Start over
            </Button>
          </>
        }
      />
    </div>
  )
}
