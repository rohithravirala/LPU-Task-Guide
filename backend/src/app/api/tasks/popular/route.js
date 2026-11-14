import { apiHandler } from '@/lib/apiHandler';
import * as taskController from '@/controllers/taskController';

export const GET = apiHandler(taskController.getPopularTasks);
