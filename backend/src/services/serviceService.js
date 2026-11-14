// Business logic for the Service entity (university portals, apps, departments).
import Service from '../models/Service.js';
import Task from '../models/Task.js';
import TaskStep from '../models/TaskStep.js';
import { ApiError } from '../utils/apiError.js';
import { isAdmin } from '../middleware/authMiddleware.js';
import { isObjectId } from './taskQueries.js';

export async function listServices({ includeInactive } = {}, viewer) {
  const filter = includeInactive && isAdmin(viewer) ? {} : { isActive: true };
  return Service.find(filter).sort({ name: 1 });
}

/** A service plus the active tasks that rely on it (as primary service or in a step). */
export async function getServiceDetails(id, viewer) {
  const service = isObjectId(id) ? await Service.findById(id) : null;
  if (!service || (!service.isActive && !isAdmin(viewer))) {
    throw ApiError.notFound('Service not found');
  }

  const taskIds = await TaskStep.distinct('taskId', { serviceId: service._id });
  const usedIn = await Task.find({
    isActive: true,
    $or: [{ _id: { $in: taskIds } }, { primaryServiceId: service._id }],
  })
    .select('title slug')
    .sort({ title: 1 })
    .limit(20);

  return { service, usedIn };
}
