import { apiHandler } from '@/lib/apiHandler';
import * as taskController from '@/controllers/taskController';

// Public read (admins may request inactive tasks); only admins can create.
export const GET = apiHandler(taskController.getTasks, { auth: 'optional' });
export const POST = apiHandler(taskController.createTask, { roles: ['admin'] });
