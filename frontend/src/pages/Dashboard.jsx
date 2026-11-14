import TaskList from '../modules/taskCatalogue/TaskList'
import YourUpdates from '../modules/taskCatalogue/YourUpdates'
import { getStudent } from '../services/api'

// First page after login (Module 1 – Task Catalogue):
// quick links, search, "Your updates" right under the search box, then every task.
export default function Dashboard() {
  const firstName = getStudent()?.name?.split(' ')[0] ?? 'there'

  return (
    <div>
      <h1 className="text-3xl font-bold sm:text-4xl">Hi {firstName}, what do you want to do today?</h1>
      <p className="mt-2 max-w-3xl text-lg text-muted">
        Every task from UMS, LPU Live, CodeTantra, NeoColab and LPU Touch in one place.
      </p>

      <div className="mt-8">
        <TaskList belowSearch={<YourUpdates />} />
      </div>
    </div>
  )
}
