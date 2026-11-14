import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { PageHeader } from '../../../components/ui/SectionHeader'
import { ErrorState } from '../../../components/ui/StatusMessage'
import { PageLoader } from '../../../components/Loader'
import { getServices } from '../../taskJourney/services/journeyService'
import TaskForm from '../components/TaskForm'
import { useCategories } from '../hooks/useTaskFilters'
import { createTask } from '../services/taskService'

/** Admin: create a task together with its journey steps (Task 4). */
export default function CreateTask() {
  useDocumentTitle('New task')
  const navigate = useNavigate()
  const categoriesQuery = useCategories({ includeInactive: true })
  const servicesQuery = useApiQuery(({ signal }) => getServices({ includeInactive: true }, { signal }), [])

  const loading = categoriesQuery.loading || servicesQuery.loading
  const error = categoriesQuery.error ?? servicesQuery.error

  const handleSubmit = async (payload) => {
    const created = await createTask(payload)
    toast.success('Task created')
    navigate(`/tasks/${created.task.slug}`)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Administration · New task"
        title="Create a task"
        description="Describe the task, then build the ordered journey students will follow. New guidance starts as unverified."
      />
      <div className="mt-8">
        {error ? (
          <ErrorState
            error={error}
            onRetry={() => {
              categoriesQuery.refetch()
              servicesQuery.refetch()
            }}
          />
        ) : loading ? (
          <PageLoader label="Loading form" />
        ) : (
          <TaskForm
            categories={categoriesQuery.data}
            services={servicesQuery.data}
            submitLabel="Create task"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/tasks')}
          />
        )}
      </div>
    </div>
  )
}
