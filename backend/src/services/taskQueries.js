import Task from '../models/Task.js';
import '../models/Category.js'; // registers models used by populate()
import '../models/Service.js';
import '../models/TaskStep.js';
import { ApiError } from '../utils/apiError.js';
import { isAdmin } from '../middleware/authMiddleware.js';

/**
 * Read helpers shared by the task, journey and dashboard services.
 * Keeping them here avoids circular imports between those services.
 */

export const CATEGORY_FIELDS = 'name slug code icon description';
export const SERVICE_SUMMARY_FIELDS = 'name shortName serviceType verificationStatus officialUrl';
export const SERVICE_DETAIL_FIELDS = `${SERVICE_SUMMARY_FIELDS} description accessNotes`;

// Long text fields are left out of list responses to keep payloads small.
export const TASK_LIST_SELECT = '-description -purpose -importantNotes';

export const TASK_LIST_POPULATE = [
  { path: 'category', select: CATEGORY_FIELDS },
  { path: 'primaryService', select: SERVICE_SUMMARY_FIELDS },
  { path: 'stepCount' },
];

const OBJECT_ID = /^[a-f\d]{24}$/i;

export function isObjectId(value) {
  return typeof value === 'string' && OBJECT_ID.test(value);
}

/** Finds a task by id or slug. Inactive tasks are only visible to admins. */
export async function findTaskOrThrow(ref, viewer) {
  const key = String(ref ?? '').trim();
  const filter = isObjectId(key) ? { _id: key } : { slug: key.toLowerCase() };
  const task = await Task.findOne(filter);

  if (!task || (!task.isActive && !isAdmin(viewer))) {
    throw ApiError.notFound('Task not found');
  }
  return task;
}

/**
 * Task-to-service mapping: the distinct services a task relies on, primary service
 * first, each with the number of steps that use it.
 */
export function collectServices(primaryService, steps) {
  const services = new Map();

  const add = (service, isPrimary) => {
    if (!service) return;
    const id = String(service._id);
    const entry = services.get(id) ?? { ...service.toJSON(), stepCount: 0, isPrimary: false };
    if (isPrimary) entry.isPrimary = true;
    services.set(id, entry);
    return entry;
  };

  add(primaryService, true);
  for (const step of steps) {
    const entry = add(step.service, false);
    if (entry) entry.stepCount += 1;
  }

  return [...services.values()];
}

export function summariseSteps(steps) {
  const requiredSteps = steps.filter((step) => step.isRequired).length;
  return {
    totalSteps: steps.length,
    requiredSteps,
    optionalSteps: steps.length - requiredSteps,
  };
}
