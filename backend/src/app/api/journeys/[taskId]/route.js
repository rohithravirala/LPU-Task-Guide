import { apiHandler } from '@/lib/apiHandler';
import * as journeyController from '@/controllers/journeyController';

// [taskId] accepts a task id or slug.
export const GET = apiHandler(journeyController.getJourney, { auth: 'optional' });
