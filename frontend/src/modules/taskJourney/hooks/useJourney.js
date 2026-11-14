import { useCallback, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { getJourney } from '../services/journeyService'
import { loadProgress, progressStorage, saveProgress } from '../services/journeyProgress'

const NO_STEPS = []
const NO_IDS = []

/**
 * Derives progress from the ordered steps and the set of completed step ids.
 * The "current" step (You are here) is the first REQUIRED step not yet done;
 * optional steps never block completion.
 */
export function summariseProgress(steps, completed) {
  const required = steps.filter((step) => step.isRequired)
  const requiredCompleted = required.filter((step) => completed.has(step._id)).length
  const completedCount = steps.filter((step) => completed.has(step._id)).length

  let currentIndex = steps.findIndex((step) => step.isRequired && !completed.has(step._id))
  if (required.length === 0) currentIndex = steps.findIndex((step) => !completed.has(step._id))

  const finished = required.length > 0 ? requiredCompleted === required.length : completedCount === steps.length
  const status = finished && steps.length > 0 ? 'completed' : completedCount === 0 ? 'not_started' : 'in_progress'
  const base = required.length || steps.length
  const done = required.length ? requiredCompleted : completedCount

  return {
    total: steps.length,
    completed: completedCount,
    remaining: steps.length - completedCount,
    required: required.length,
    requiredCompleted,
    requiredRemaining: required.length - requiredCompleted,
    optional: steps.length - required.length,
    optionalCompleted: completedCount - requiredCompleted,
    percent: base ? Math.round((done / base) * 100) : 0,
    status,
    currentIndex,
    currentStepId: currentIndex >= 0 ? steps[currentIndex]._id : null,
  }
}

/**
 * State and actions for the Task Journey page (Tasks 16–20).
 * Completing a step updates the UI immediately (optimistic) and saves in the
 * background through journeyProgress.js. Saves run one at a time, in order.
 */
export function useJourney(taskRef) {
  const { user } = useAuth()
  const userId = user?._id ?? null

  const journeyQuery = useApiQuery(({ signal }) => getJourney(taskRef, { signal }), [taskRef], {
    enabled: Boolean(taskRef),
  })
  const journey = journeyQuery.data
  const steps = journey?.steps ?? NO_STEPS
  const taskId = journey?.task?._id ?? null

  const progressQuery = useApiQuery(({ signal }) => loadProgress({ userId, taskId, signal }), [userId, taskId], {
    enabled: Boolean(userId && taskId),
  })

  // Completed steps changed on this page (null until the student changes something).
  const [localCompleted, setLocalCompleted] = useState(null)
  const [focusIndex, setFocusIndex] = useState(null)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const saveQueue = useRef(Promise.resolve())
  const progressIdRef = useRef(null)

  const completedIds = useMemo(() => {
    const valid = new Set(steps.map((step) => step._id))
    const source = localCompleted ?? progressQuery.data?.completedStepIds ?? NO_IDS
    // Ignore ids of steps an admin has since removed.
    return new Set(source.filter((id) => valid.has(id)))
  }, [steps, localCompleted, progressQuery.data])

  const progress = useMemo(() => summariseProgress(steps, completedIds), [steps, completedIds])

  const defaultIndex = progress.currentIndex >= 0 ? progress.currentIndex : Math.max(0, steps.length - 1)
  const activeIndex = Math.min(Math.max(focusIndex ?? defaultIndex, 0), Math.max(steps.length - 1, 0))
  const savedProgressId = progressQuery.data?.progressId ?? null

  const persist = useCallback(
    (nextIds, currentStepId) => {
      if (!userId || !taskId) return
      setSaveState('saving')
      saveQueue.current = saveQueue.current
        .then(async () => {
          const result = await saveProgress({
            userId,
            taskId,
            progressId: progressIdRef.current ?? savedProgressId,
            completedStepIds: nextIds,
            currentStepId,
          })
          progressIdRef.current = result.progressId ?? progressIdRef.current
          setSaveState('saved')
        })
        .catch(() => setSaveState('error'))
    },
    [userId, taskId, savedProgressId],
  )

  const setStepComplete = useCallback(
    (stepId, done) => {
      const next = new Set(completedIds)
      if (done) next.add(stepId)
      else next.delete(stepId)
      const nextIds = steps.filter((step) => next.has(step._id)).map((step) => step._id) // keep journey order
      const summary = summariseProgress(steps, next)
      setLocalCompleted(nextIds)
      persist(nextIds, summary.currentStepId)
      return { summary, next }
    },
    [completedIds, steps, persist],
  )

  /** Marks a step done and moves to the next unfinished step. */
  const completeAndContinue = useCallback(
    (stepId) => {
      const { summary, next } = setStepComplete(stepId, true)
      const index = steps.findIndex((step) => step._id === stepId)
      const after = steps.findIndex((step, i) => i > index && !next.has(step._id))
      const target = after >= 0 ? after : summary.currentIndex
      if (target >= 0) setFocusIndex(target)
    },
    [setStepComplete, steps],
  )

  const goTo = useCallback((index) => setFocusIndex(index), [])
  const goNext = useCallback(() => setFocusIndex(Math.min(activeIndex + 1, steps.length - 1)), [activeIndex, steps.length])
  const goPrevious = useCallback(() => setFocusIndex(Math.max(activeIndex - 1, 0)), [activeIndex])

  const resetProgress = useCallback(() => {
    setLocalCompleted([])
    setFocusIndex(0)
    persist([], summariseProgress(steps, new Set()).currentStepId)
  }, [persist, steps])

  const retrySave = useCallback(() => persist([...completedIds], progress.currentStepId), [persist, completedIds, progress.currentStepId])

  return {
    task: journey?.task ?? null,
    steps,
    services: journey?.services ?? [],
    summary: journey?.summary ?? null,
    loading: journeyQuery.loading || (Boolean(taskId) && progressQuery.loading && !progressQuery.data),
    error: journeyQuery.error,
    progressError: progressQuery.error,
    refetch: journeyQuery.refetch,
    completedIds,
    progress,
    activeIndex,
    activeStep: steps[activeIndex] ?? null,
    hasNavigated: focusIndex !== null,
    saveState,
    storage: progressStorage,
    goTo,
    goNext,
    goPrevious,
    setStepComplete,
    completeAndContinue,
    resetProgress,
    retrySave,
  }
}
