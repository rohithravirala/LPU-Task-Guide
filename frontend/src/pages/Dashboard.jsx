import DemoUpdates from '../modules/taskCatalogue/DemoUpdates'
import TaskList from '../modules/taskCatalogue/TaskList'
import { getStudent } from '../services/api'

// First page after login: updates (demo account only) and every task from every portal
// (Module 1 – Task Catalogue).
export default function Dashboard() {
  const firstName = getStudent()?.name?.split(' ')[0] ?? 'there'

  return (
    <div>
      <h1 className="text-3xl font-bold sm:text-[40px]">Hi {firstName}, what do you want to do today?</h1>
      <p className="mt-3 max-w-3xl text-lg text-muted">
        Every task from UMS, LPU Live, CodeTantra, NeoColab and LPU Touch in one place. Click a task to open it on the right
        portal, or see the steps first.
      </p>
      <DemoUpdates />
      <TaskList />
    </div>
  )
}
