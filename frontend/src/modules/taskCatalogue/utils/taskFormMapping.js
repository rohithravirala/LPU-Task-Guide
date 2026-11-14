/**
 * Converts between the API task shape and the admin form's values.
 * Lists (requirements, instructions, ...) are edited as one item per line.
 */

export const EMPTY_STEP = {
  stepId: '',
  title: '',
  description: '',
  instructionsText: '',
  serviceId: '',
  isRequired: true,
  prerequisitesText: '',
  additionalNotes: '',
  checklistText: '',
}

const toLines = (items) => (items ?? []).join('\n')
const fromLines = (text) =>
  (text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

export function toFormValues(task, steps) {
  return {
    title: task?.title ?? '',
    summary: task?.summary ?? '',
    description: task?.description ?? '',
    purpose: task?.purpose ?? '',
    categoryId: task?.categoryId ?? '',
    primaryServiceId: task?.primaryServiceId ?? '',
    estimatedDuration: task?.estimatedDuration ?? '',
    verificationStatus: task?.verificationStatus ?? 'unverified',
    isFeatured: task?.isFeatured ?? false,
    isActive: task?.isActive ?? true,
    requirementsText: toLines(task?.requirements),
    importantNotesText: toLines(task?.importantNotes),
    keywordsText: (task?.keywords ?? []).join(', '),
    steps: steps?.length
      ? steps.map((step) => ({
          stepId: step._id,
          title: step.title,
          description: step.description ?? '',
          instructionsText: toLines(step.instructions),
          serviceId: step.serviceId ?? '',
          isRequired: step.isRequired ?? true,
          prerequisitesText: toLines(step.prerequisites),
          additionalNotes: step.additionalNotes ?? '',
          checklistText: toLines(step.checklist),
        }))
      : [{ ...EMPTY_STEP }],
  }
}

export function toPayload(values) {
  return {
    title: values.title,
    summary: values.summary,
    description: values.description,
    purpose: values.purpose,
    categoryId: values.categoryId,
    primaryServiceId: values.primaryServiceId || null,
    estimatedDuration: values.estimatedDuration === '' ? null : Number(values.estimatedDuration),
    verificationStatus: values.verificationStatus,
    isFeatured: values.isFeatured,
    isActive: values.isActive,
    requirements: fromLines(values.requirementsText),
    importantNotes: fromLines(values.importantNotesText),
    keywords: values.keywordsText
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    steps: values.steps.map((step) => ({
      ...(step.stepId ? { _id: step.stepId } : {}),
      title: step.title,
      description: step.description,
      instructions: fromLines(step.instructionsText),
      serviceId: step.serviceId || null,
      isRequired: step.isRequired,
      prerequisites: fromLines(step.prerequisitesText),
      additionalNotes: step.additionalNotes,
      checklist: fromLines(step.checklistText),
    })),
  }
}

// API error paths (e.g. "requirements.2", "steps.0.instructions.1") -> form field names.
const LIST_FIELDS = { requirements: 'requirementsText', importantNotes: 'importantNotesText', keywords: 'keywordsText' }
const STEP_LIST_FIELDS = { instructions: 'instructionsText', prerequisites: 'prerequisitesText', checklist: 'checklistText' }

export function toFormField(path) {
  const [head, index, field] = path.split('.')
  if (head === 'steps') {
    if (index === undefined) return 'steps.root'
    return `steps.${index}.${STEP_LIST_FIELDS[field] ?? (field === '_id' ? 'title' : field)}`
  }
  return LIST_FIELDS[head] ?? head
}
