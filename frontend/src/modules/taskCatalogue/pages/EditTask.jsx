import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { SearchX } from 'lucide-react'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { PageHeader } from '../../../components/ui/SectionHeader'
import { ButtonLink } from '../../../components/ui/Button'
import { EmptyState, ErrorState } from '../../../components/ui/StatusMessage'
import { PageLoader } from '../../../components/Loader'
import { getJourney, getServices } from '../../taskJourney/services/journeyService'
import TaskForm from '../components/TaskForm'
import DeleteTaskModal from '../components/DeleteTaskModal'
import { useCategories } from '../hooks/useTaskFilters'
import { updateTask } from '../services/taskService'

/** Admin: edit a task and its steps, or delete it (Task 13). */
export default function EditTask() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)

  // The journey endpoint returns the task plus full step details (instructions, checklist...).
  const journeyQuery = useApiQuery(({ signal }) => getJourney(id, { signal }), [id])
  const categoriesQuery = useCategories({ includeInactive: true })
  const servicesQuery = useApiQuery(({ signal }) => getServices({ includeInactive: true }, { signal }), [])
  useDocumentTitle(journeyQuery.data ? `Edit: ${journeyQuery.data.task.title}` : 'Edit task')

  const loading = journeyQuery.loading || categoriesQuery.loading || servicesQuery.loading
  const error = journeyQuery.error ?? categoriesQuery.error ?? servicesQuery.error
  const task = journeyQuery.data?.task

  const handleSubmit = async (payload) => {
    const updated = await updateTask(id, payload)
    toast.success('Changes saved')
    navigate(`/tasks/${updated.task.slug}`)
  }

  if (error?.isNotFound) {
    return (
      <EmptyState
        icon={SearchX}
        title="Task not found"
        description="It may have been deleted."
        action={
          <ButtonLink to="/admin/tasks" variant="secondary" size="sm">
            Back to Manage tasks
          </ButtonLink>
        }
      />
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Administration · Edit task"
        title={task?.title ?? 'Edit task'}
        description="Changes apply immediately. Reordering keeps each step's identity, so students' saved progress stays valid."
      />
      <div className="mt-8">
        {error ? (
          <ErrorState
            error={error}
            onRetry={() => {
              journeyQuery.refetch()
              categoriesQuery.refetch()
              servicesQuery.refetch()
            }}
          />
        ) : loading || !task ? (
          <PageLoader label="Loading task" />
        ) : (
          <TaskForm
            key={task._id}
            task={task}
            steps={journeyQuery.data.steps}
            categories={categoriesQuery.data}
            services={servicesQuery.data}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/tasks')}
            onDelete={() => setDeleteOpen(true)}
          />
        )}
      </div>

      <DeleteTaskModal
        task={task ? { ...task, stepCount: journeyQuery.data?.steps.length } : null}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => navigate('/admin/tasks', { replace: true })}
      />
    </div>
  )
}
