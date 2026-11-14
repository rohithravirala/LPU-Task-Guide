import { apiHandler } from '@/lib/apiHandler';
import * as taskController from '@/controllers/taskController';

// Always scoped to the signed-in student; no user id is accepted from the client.
export const GET = apiHandler(taskController.getRecentTasks, { auth: 'required' });
