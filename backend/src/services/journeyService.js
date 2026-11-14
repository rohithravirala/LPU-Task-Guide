import TaskStep from '../models/TaskStep.js';
import {
  CATEGORY_FIELDS,
  SERVICE_DETAIL_FIELDS,
  collectServices,
  findTaskOrThrow,
  summariseSteps,
} from './taskQueries.js';

/**
 * Builds a task's guided journey: the task, its ordered steps with the responsible
 * service populated, the distinct services involved, and step counts.
 * Progress (which steps a student completed) is owned by Module 2 Part 2.
 */
export async function getJourney(taskRef, viewer) {
  const task = await findTaskOrThrow(taskRef, viewer);
  await task.populate([
    { path: 'category', select: CATEGORY_FIELDS },
    { path: 'primaryService', select: SERVICE_DETAIL_FIELDS },
  ]);

  const steps = await TaskStep.find({ taskId: task._id })
    .sort({ order: 1 })
    .populate({ path: 'service', select: SERVICE_DETAIL_FIELDS });

  return {
    task,
    steps,
    services: collectServices(task.primaryService, steps),
    summary: summariseSteps(steps),
  };
}
