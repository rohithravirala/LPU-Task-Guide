import { useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Save, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Checkbox, Field, Select, TextArea, TextInput } from '../../../components/ui/Field'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import TaskStepsEditor from './TaskStepsEditor'
import { toFormField, toFormValues, toPayload } from '../utils/taskFormMapping'

function FormSection({ index, title, description, children }) {
  return (
    <section className="border-t border-line pt-6">
      <SectionHeader index={index} title={title} description={description} as="h2" />
      <div className="mt-6">{children}</div>
    </section>
  )
}

/** Create / edit a task and its ordered journey steps (admin only). */
export default function TaskForm({ task, steps, categories, services, submitLabel, onSubmit, onCancel, onDelete }) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: toFormValues(task, steps) })

  const verification = useWatch({ control, name: 'verificationStatus' })

  const submit = handleSubmit(
    async (values) => {
      try {
        await onSubmit(toPayload(values))
      } catch (error) {
        Object.entries(error.errors ?? {}).forEach(([path, message]) =>
          setError(toFormField(path), { type: 'server', message }),
        )
        toast.error(error.message)
      }
    },
    () => toast.error('Some fields need attention'),
  )

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-10">
        <FormSection index="01" title="Basics" description="What students see in the catalogue and in search.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Task title" htmlFor="title" error={errors.title?.message} className="md:col-span-2">
              <TextInput
                id="title"
                invalid={Boolean(errors.title)}
                placeholder="e.g. Check your attendance"
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 4, message: 'Title must be at least 4 characters' },
                  maxLength: { value: 120, message: 'Title must be 120 characters or fewer' },
                })}
              />
            </Field>
            <Field
              label="Summary"
              htmlFor="summary"
              hint="One sentence shown on task cards."
              error={errors.summary?.message}
              className="md:col-span-2"
            >
              <TextInput
                id="summary"
                invalid={Boolean(errors.summary)}
                {...register('summary', {
                  required: 'Summary is required',
                  minLength: { value: 10, message: 'Summary must be at least 10 characters' },
                  maxLength: { value: 220, message: 'Summary must be 220 characters or fewer' },
                })}
              />
            </Field>
            <Field label="Category" htmlFor="categoryId" error={errors.categoryId?.message}>
              <Select
                id="categoryId"
                invalid={Boolean(errors.categoryId)}
                {...register('categoryId', { required: 'Choose a category' })}
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.code} · {category.name}
                    {category.isActive ? '' : ' (hidden)'}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Main service" htmlFor="primaryServiceId" optional error={errors.primaryServiceId?.message}>
              <Select id="primaryServiceId" invalid={Boolean(errors.primaryServiceId)} {...register('primaryServiceId')}>
                <option value="">None</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Estimated time (minutes)"
              htmlFor="estimatedDuration"
              optional
              hint="Leave empty if it cannot be reasonably estimated."
              error={errors.estimatedDuration?.message}
            >
              <TextInput
                id="estimatedDuration"
                type="number"
                inputMode="numeric"
                min={1}
                max={600}
                invalid={Boolean(errors.estimatedDuration)}
                {...register('estimatedDuration', {
                  min: { value: 1, message: 'Use at least 1 minute' },
                  max: { value: 600, message: 'Use 600 minutes or fewer' },
                  pattern: { value: /^\d*$/, message: 'Use whole minutes' },
                })}
              />
            </Field>
            <Field
              label="Search keywords"
              htmlFor="keywordsText"
              optional
              hint="Comma separated. Add the words students actually use, e.g. fine, dues."
              error={errors.keywordsText?.message}
            >
              <TextInput id="keywordsText" {...register('keywordsText')} />
            </Field>
          </div>
        </FormSection>

        <FormSection index="02" title="Guidance" description="Shown on the task details page before a student starts.">
          <div className="grid gap-5">
            <Field label="Full description" htmlFor="description" error={errors.description?.message}>
              <TextArea
                id="description"
                rows={5}
                invalid={Boolean(errors.description)}
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 20, message: 'Description must be at least 20 characters' },
                  maxLength: { value: 4000, message: 'Description must be 4000 characters or fewer' },
                })}
              />
            </Field>
            <Field label="Why it matters" htmlFor="purpose" optional error={errors.purpose?.message}>
              <TextArea id="purpose" rows={3} {...register('purpose', { maxLength: { value: 1000, message: 'Use 1000 characters or fewer' } })} />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Before you start"
                htmlFor="requirementsText"
                optional
                hint="Documents or prerequisites, one per line."
                error={errors.requirementsText?.message}
              >
                <TextArea id="requirementsText" rows={4} {...register('requirementsText')} />
              </Field>
              <Field
                label="Important instructions"
                htmlFor="importantNotesText"
                optional
                hint="One per line."
                error={errors.importantNotesText?.message}
              >
                <TextArea id="importantNotesText" rows={4} {...register('importantNotesText')} />
              </Field>
            </div>
          </div>
        </FormSection>

        <FormSection
          index="03"
          title="Journey steps"
          description="The ordered route a student follows. Map each step to the service responsible for it."
        >
          <TaskStepsEditor control={control} register={register} errors={errors} services={services} />
        </FormSection>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="border border-line bg-surface p-5">
          <p className="label-mono text-stone-deep">Publishing</p>
          <div className="mt-4 space-y-4">
            <Checkbox
              id="isActive"
              label="Visible to students"
              description="Hidden tasks stay editable but disappear from the catalogue."
              {...register('isActive')}
            />
            <Checkbox
              id="isFeatured"
              label="Recommend this task"
              description="Shown as a starting point on dashboards."
              {...register('isFeatured')}
            />
            <fieldset className="border-t border-line pt-4">
              <legend className="text-sm font-medium text-ink">Guidance status</legend>
              <div className="mt-3 space-y-2">
                {[
                  { value: 'unverified', label: 'Unverified (illustrative)' },
                  { value: 'verified', label: 'Verified against official sources' },
                ].map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-sm">
                    <input type="radio" value={option.value} className="size-4 accent-ink" {...register('verificationStatus')} />
                    {option.label}
                  </label>
                ))}
              </div>
              {verification === 'verified' && (
                <p className="mt-3 text-[12px] leading-relaxed text-vermilion-deep">
                  Only mark as verified after checking every step and service against an official university source.
                </p>
              )}
            </fieldset>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Button type="submit" icon={Save} loading={isSubmitting} className="w-full">
              {submitLabel}
            </Button>
            <Button variant="ghost" onClick={onCancel} className="w-full" disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>

        {onDelete && (
          <div className="border border-vermilion/40 bg-surface p-5">
            <p className="label-mono text-vermilion-deep">Danger zone</p>
            <p className="mt-2 text-[13px] text-stone-deep">Deleting removes the task and all of its steps permanently.</p>
            <Button variant="danger" size="sm" icon={Trash2} className="mt-4" onClick={onDelete}>
              Delete task
            </Button>
          </div>
        )}
      </aside>
    </form>
  )
}
