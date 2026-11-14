// The link a task's "Open" button uses: the task's exact page when we have a checked one,
// otherwise the home page of the portal the task is done on. Empty when there is no portal.
// `task.portal` must be populated (the full portal document, not just its id).
export function openUrlFor(task) {
  return task.url || task.portal?.url || '';
}
