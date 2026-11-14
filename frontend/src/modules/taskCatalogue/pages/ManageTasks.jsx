import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { PageHeader } from '../../../components/ui/SectionHeader'
import { Button, ButtonLink } from '../../../components/ui/Button'
import { Field, Select, TextInput } from '../../../components/ui/Field'
import { CategoryCode, Tag, VerificationTag } from '../../../components/ui/Tag'
import { EmptyState, ErrorState } from '../../../components/ui/StatusMessage'
import { Skeleton } from '../../../components/Loader'
import { formatDate } from '../../../utils/formatDate'
import DeleteTaskModal from '../components/DeleteTaskModal'
import { useCategories } from '../hooks/useTaskFilters'
import { useTasks } from '../hooks/useTasks'

const PAGE_SIZE = 50

function RowActions({ task, onDelete }) {
  const iconLink = 'inline-flex size-8 items-center justify-center rounded-sm text-stone-deep hover:bg-paper-deep hover:text-ink'
  return (
    <div className="flex items-center justify-end gap-1">
      <Link to={`/tasks/${task.slug}`} className={iconLink} aria-label={`View ${task.title}`} title="View as student">
        <Eye className="size-4" aria-hidden="true" />
      </Link>
      <Link to={`/admin/tasks/${task._id}/edit`} className={iconLink} aria-label={`Edit ${task.title}`} title="Edit">
        <Pencil className="size-4" aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={() => onDelete(task)}
        className="inline-flex size-8 items-center justify-center rounded-sm text-stone-deep hover:bg-vermilion-wash hover:text-vermilion-deep"
        aria-label={`Delete ${task.title}`}
        title="Delete"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

/** Admin list of every task, including hidden ones (Task 13). */
export default function ManageTasks() {
  useDocumentTitle('Manage tasks')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('all')
  const [text, setText] = useState('')
  const [page, setPage] = useState(1)
  const [taskToDelete, setTaskToDelete] = useState(null)

  const categoriesQuery = useCategories({ includeInactive: true })
  const tasksQuery = useTasks({ includeInactive: true, sort: 'updated', category: category || undefined, page, limit: PAGE_SIZE })
  const meta = tasksQuery.data?.meta
  const needle = text.trim().toLowerCase()

  const tasks = (tasksQuery.data?.items ?? []).filter((task) => {
    if (status === 'visible' && !task.isActive) return false
    if (status === 'hidden' && task.isActive) return false
    if (status === 'unverified' && task.verificationStatus === 'verified') return false
    return !needle || task.title.toLowerCase().includes(needle) || task.slug.includes(needle)
  })

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Manage tasks"
        description="Create, edit, hide or delete the tasks and journeys students see."
        actions={
          <ButtonLink to="/admin/tasks/new" icon={Plus}>
            New task
          </ButtonLink>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Field label="Filter by title" htmlFor="filter-text">
          <TextInput id="filter-text" type="search" value={text} onChange={(event) => setText(event.target.value)} />
        </Field>
        <Field label="Category" htmlFor="filter-admin-category">
          <Select
            id="filter-admin-category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All categories</option>
            {(categoriesQuery.data ?? []).map((item) => (
              <option key={item._id} value={item.slug}>
                {item.code} · {item.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="filter-status">
          <Select id="filter-status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All tasks</option>
            <option value="visible">Visible to students</option>
            <option value="hidden">Hidden</option>
            <option value="unverified">Unverified guidance</option>
          </Select>
        </Field>
      </div>

      <div className="mt-6">
        {tasksQuery.error ? (
          <ErrorState error={tasksQuery.error} onRetry={tasksQuery.refetch} />
        ) : tasksQuery.loading && !tasksQuery.data ? (
          <div className="space-y-2 border-y border-line py-4">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={meta?.total ? 'No tasks match these filters' : 'No tasks yet'}
            description={meta?.total ? 'Change the filters to see more tasks.' : 'Create the first task and its journey steps.'}
            action={
              !meta?.total && (
                <ButtonLink to="/admin/tasks/new" size="sm" icon={Plus}>
                  New task
                </ButtonLink>
              )
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto border border-line bg-surface md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-paper">
                  <tr className="label-mono text-stone-deep">
                    <th scope="col" className="px-4 py-3 font-medium">Task</th>
                    <th scope="col" className="px-4 py-3 font-medium">Category</th>
                    <th scope="col" className="px-4 py-3 font-medium">Steps</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                    <th scope="col" className="px-4 py-3 font-medium">Updated</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {tasks.map((task) => (
                    <tr key={task._id} className="align-top hover:bg-paper/60">
                      <td className="max-w-md px-4 py-3">
                        <Link to={`/admin/tasks/${task._id}/edit`} className="font-medium text-ink hover:underline">
                          {task.title}
                        </Link>
                        <p className="num-mono truncate text-[12px] text-stone">/{task.slug}</p>
                      </td>
                      <td className="px-4 py-3">
                        <CategoryCode code={task.category?.code} />
                      </td>
                      <td className="num-mono px-4 py-3">{task.stepCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Tag tone={task.isActive ? 'outline' : 'vermilion'}>{task.isActive ? 'Visible' : 'Hidden'}</Tag>
                          <VerificationTag status={task.verificationStatus} />
                          {task.isFeatured && <Tag tone="chartreuse">Recommended</Tag>}
                        </div>
                      </td>
                      <td className="num-mono px-4 py-3 text-[13px] whitespace-nowrap text-stone-deep">{formatDate(task.updatedAt)}</td>
                      <td className="px-4 py-2">
                        <RowActions task={task} onDelete={setTaskToDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <ul className="divide-y divide-line border-y border-line md:hidden">
              {tasks.map((task) => (
                <li key={task._id} className="py-4">
                  <div className="flex items-start gap-3">
                    <CategoryCode code={task.category?.code} />
                    <div className="min-w-0 flex-1">
                      <Link to={`/admin/tasks/${task._id}/edit`} className="font-medium text-ink hover:underline">
                        {task.title}
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Tag tone={task.isActive ? 'outline' : 'vermilion'}>{task.isActive ? 'Visible' : 'Hidden'}</Tag>
                        <VerificationTag status={task.verificationStatus} />
                      </div>
                      <p className="num-mono mt-2 text-[12px] text-stone">
                        {task.stepCount} steps · updated {formatDate(task.updatedAt)}
                      </p>
                    </div>
                    <RowActions task={task} onDelete={setTaskToDelete} />
                  </div>
                </li>
              ))}
            </ul>

            {meta?.totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-5 flex items-center justify-between">
                <p className="num-mono text-[13px] text-stone-deep">
                  Page {meta.page} of {meta.totalPages} · {meta.total} tasks
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" icon={ArrowLeft} disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    iconRight={ArrowRight}
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </nav>
            )}
          </>
        )}
      </div>

      <DeleteTaskModal
        task={taskToDelete}
        open={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onDeleted={() => {
          setTaskToDelete(null)
          tasksQuery.refetch()
        }}
      />
    </div>
  )
}
