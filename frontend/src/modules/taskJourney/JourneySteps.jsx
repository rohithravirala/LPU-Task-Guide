import StepCard from './StepCard'

// All steps of the guide, in order.
export default function JourneySteps({ steps, portalId, doneSteps, currentStepId, onToggle }) {
  return (
    <ol className="mt-8 space-y-4">
      {steps.map((step) => (
        <li key={step._id}>
          <StepCard
            step={step}
            portalId={portalId}
            isDone={doneSteps.includes(step._id)}
            isCurrent={step._id === currentStepId}
            onToggle={() => onToggle(step._id)}
          />
        </li>
      ))}
    </ol>
  )
}
