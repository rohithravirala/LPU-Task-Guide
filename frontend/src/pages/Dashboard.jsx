import TaskList from '../modules/taskCatalogue/TaskList'
import { getStudent } from '../services/api'

// First page after login: all tasks (Module 1 – Task Catalogue).
export default function Dashboard() {
  const firstName = getStudent()?.name?.split(' ')[0] ?? 'there'

  return (
    <div>
      <h1 className="text-3xl font-bold sm:text-4xl">Hi {firstName}, what do you want to do today?</h1>
      <p className="mt-3 max-w-2xl text-lg text-stone-deep">
        Pick a task below. We will show you every step, where to go, and what to keep ready.
      </p>
      <TaskList />
    </div>
  )
}
