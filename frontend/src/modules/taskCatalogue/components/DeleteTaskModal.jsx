import { useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { deleteTask } from '../services/taskService'

/** Confirmation before permanently deleting a task (Task 13). */
export default function DeleteTaskModal({ task, open, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)

  if (!task) return null

  const confirm = async () => {
    setDeleting(true)
    try {
      const result = await deleteTask(task._id)
      toast.success(`Deleted “${task.title}”`)
      onDeleted?.(result)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={deleting ? () => {} : onClose}
      size="sm"
      title="Delete this task permanently?"
      description="This cannot be undone."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={deleting}>
            Keep task
          </Button>
          <Button variant="dangerSolid" icon={Trash2} loading={deleting} onClick={confirm}>
            Delete permanently
          </Button>
        </>
      }
    >
      <div className="border border-line bg-paper px-4 py-3">
        <p className="font-medium text-ink">{task.title}</p>
        {typeof task.stepCount === 'number' && (
          <p className="num-mono mt-0.5 text-[13px] text-stone-deep">{task.stepCount} journey steps</p>
        )}
      </div>
      <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-charcoal">
        <li>The task and all of its journey steps are removed.</li>
        <li>Students will no longer find it, and saved progress for it stops opening.</li>
        <li>
          To hide it temporarily instead, edit the task and untick <strong>Visible to students</strong>.
        </li>
      </ul>
    </Modal>
  )
}
