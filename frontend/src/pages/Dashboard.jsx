import TaskList from '../modules/taskCatalogue/TaskList'
import YourUpdates from '../modules/taskCatalogue/YourUpdates'
import { getStudent } from '../services/api'

// First page after login (Module 1 – Task Catalogue), laid out like the UMS dashboard:
// every task on the left, "Your updates" as a column on the right.
export default function Dashboard() {
  const firstName = getStudent()?.name?.split(' ')[0] ?? 'there'

  return (
    <div>
      <h1 className="text-3xl font-bold sm:text-4xl">Hi {firstName}, what do you want to do today?</h1>
      <p className="mt-2 max-w-3xl text-lg text-muted">
        Every task from UMS, LPU Live, CodeTantra, NeoColab and LPU Touch in one place.
      </p>

      <div className="mt-8 grid items-start gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <TaskList />
        </div>
        {/* On phones the updates come first; on laptops they sit on the right and stay in view */}
        <aside className="order-first pt-4 lg:sticky lg:top-24 lg:order-last">
          <YourUpdates />
        </aside>
      </div>
    </div>
  )
}
