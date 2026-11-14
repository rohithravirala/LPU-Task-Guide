import { after } from 'next/server';
import { sendSuccess } from '../utils/apiResponse.js';
import * as journeyService from '../services/journeyService.js';
import { recordTaskView } from '../services/taskService.js';

export async function getJourney({ params, user }) {
  const journey = await journeyService.getJourney(params.taskId, user);
  after(() => recordTaskView(journey.task._id, user));
  return sendSuccess(journey, 'Journey retrieved successfully');
}
