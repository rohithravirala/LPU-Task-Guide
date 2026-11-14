import { apiHandler } from '@/lib/apiHandler';
import * as taskController from '@/controllers/taskController';

// [id] accepts a task id or slug.
export const GET = apiHandler(taskController.getTask, { auth: 'optional' });
export const PUT = apiHandler(taskController.updateTask, { roles: ['admin'] });
export const DELETE = apiHandler(taskController.deleteTask, { roles: ['admin'] });
