import { getTasks } from '@/controllers/taskController';

// GET /api/tasks
export async function GET(request) {
  return getTasks(request);
}
