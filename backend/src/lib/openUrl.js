export function openUrlFor(task) {
  return task.url || task.portal?.url || '';
}
