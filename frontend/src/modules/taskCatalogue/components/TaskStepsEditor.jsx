import { useFieldArray } from 'react-hook-form'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Checkbox, Field, Select, TextArea, TextInput } from '../../../components/ui/Field'
import { stationNumber } from '../../../utils/formatDate'
import { EMPTY_STEP } from '../utils/taskFormMapping'

/**
 * Ordered journey steps inside the task form. Existing steps carry their database id
 * (`stepId`) so the API can keep them stable when the order changes.
 */
export default function TaskStepsEditor({ control, register, errors, services }) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'steps',
    rules: { minLength: { value: 1, message: 'Add at least one journey step' } },
  })

  const stepErrors = errors.steps ?? []
  const rootError = errors.steps?.root?.message ?? errors.steps?.message

  return (
    <div>
      {rootError && (
        <p className="mb-4 text-[13px] text-vermilion-deep" role="alert">
          {rootError}
        </p>
      )}

      <ol className="space-y-5">
        {fields.map((field, index) => {
          const fieldErrors = stepErrors[index] ?? {}
          const id = (name) => `steps-${index}-${name}`
          return (
            <li key={field.id} className="border border-line bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper px-4 py-2.5">
                <p className="flex items-center gap-3">
                  <span className="num-mono flex size-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-paper">
                    {stationNumber(index + 1)}
                  </span>
                  <span className="label-mono text-stone-deep">Step {index + 1} of {fields.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={ArrowUp}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    aria-label={`Move step ${index + 1} up`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={ArrowDown}
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                    aria-label={`Move step ${index + 1} down`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    aria-label={`Remove step ${index + 1}`}
                  />
                </div>
              </div>

              <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-2">
                <input type="hidden" {...register(`steps.${index}.stepId`)} />
                <Field label="Step title" htmlFor={id('title')} error={fieldErrors.title?.message} className="md:col-span-2">
                  <TextInput
                    id={id('title')}
                    invalid={Boolean(fieldErrors.title)}
                    placeholder="e.g. Sign in to the official portal"
                    {...register(`steps.${index}.title`, {
                      required: 'Step title is required',
                      minLength: { value: 3, message: 'Step title must be at least 3 characters' },
                      maxLength: { value: 140, message: 'Step title must be 140 characters or fewer' },
                    })}
                  />
                </Field>

                <Field
                  label="Short description"
                  htmlFor={id('description')}
                  optional
                  error={fieldErrors.description?.message}
                  className="md:col-span-2"
                >
                  <TextInput
                    id={id('description')}
                    invalid={Boolean(fieldErrors.description)}
                    {...register(`steps.${index}.description`, {
                      maxLength: { value: 600, message: 'Use 600 characters or fewer' },
                    })}
                  />
                </Field>

                <Field label="Responsible service" htmlFor={id('serviceId')} error={fieldErrors.serviceId?.message}>
                  <Select id={id('serviceId')} invalid={Boolean(fieldErrors.serviceId)} {...register(`steps.${index}.serviceId`)}>
                    <option value="">No specific service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name}
                        {service.verificationStatus === 'verified' ? '' : ' (unverified)'}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="flex items-end pb-2">
                  <Checkbox
                    id={id('isRequired')}
                    label="Required step"
                    description="Optional steps never block completion."
                    {...register(`steps.${index}.isRequired`)}
                  />
                </div>

                <Field
                  label="Instructions"
                  htmlFor={id('instructionsText')}
                  hint="One instruction per line, in order."
                  error={fieldErrors.instructionsText?.message}
                >
                  <TextArea id={id('instructionsText')} rows={4} {...register(`steps.${index}.instructionsText`)} />
                </Field>

                <Field
                  label="Done when…"
                  htmlFor={id('checklistText')}
                  hint="Self-check items, one per line."
                  optional
                  error={fieldErrors.checklistText?.message}
                >
                  <TextArea id={id('checklistText')} rows={4} {...register(`steps.${index}.checklistText`)} />
                </Field>

                <Field
                  label="Prerequisites"
                  htmlFor={id('prerequisitesText')}
                  hint="One per line."
                  optional
                  error={fieldErrors.prerequisitesText?.message}
                >
                  <TextArea id={id('prerequisitesText')} rows={2} {...register(`steps.${index}.prerequisitesText`)} />
                </Field>

                <Field label="Important note" htmlFor={id('additionalNotes')} optional error={fieldErrors.additionalNotes?.message}>
                  <TextArea
                    id={id('additionalNotes')}
                    rows={2}
                    {...register(`steps.${index}.additionalNotes`, {
                      maxLength: { value: 1000, message: 'Use 1000 characters or fewer' },
                    })}
                  />
                </Field>
              </div>
            </li>
          )
        })}
      </ol>

      <Button
        variant="secondary"
        icon={Plus}
        className="mt-5"
        onClick={() => append({ ...EMPTY_STEP })}
        disabled={fields.length >= 30}
      >
        Add step
      </Button>
    </div>
  )
}
