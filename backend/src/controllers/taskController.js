import { after } from 'next/server';
import { getSearchParams, readJsonBody } from '../lib/apiHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parseWith } from '../validators/common.js';
import {
  createTaskSchema,
  shortListQuerySchema,
  taskListQuerySchema,
  taskSearchQuerySchema,
  updateTaskSchema,
} from '../validators/taskValidator.js';
import * as taskService from '../services/taskService.js';

export async function getTasks({ request, user }) {
  const query = parseWith(taskListQuerySchema, getSearchParams(request));
  const { items, meta } = await taskService.listTasks(query, user);
  return sendSuccess(items, 'Tasks retrieved successfully', { meta });
}

export async function searchTasks({ request }) {
  const query = parseWith(taskSearchQuerySchema, getSearchParams(request));
  const result = await taskService.searchTasks(query);
  return sendSuccess(result, `${result.total} matching task${result.total === 1 ? '' : 's'}`);
}

export async function getPopularTasks({ request }) {
  const { limit } = parseWith(shortListQuerySchema, getSearchParams(request));
  const tasks = await taskService.getPopularTasks({ limit });
  return sendSuccess(tasks, 'Popular tasks retrieved successfully');
}

export async function getRecentTasks({ request, user }) {
  const { limit } = parseWith(shortListQuerySchema, getSearchParams(request));
  const recent = await taskService.getRecentTasks(user, { limit });
  return sendSuccess(recent, 'Recently opened tasks retrieved successfully');
}

export async function getTask({ params, user }) {
  const details = await taskService.getTaskDetails(params.id, user);
  // Record the visit after the response is sent so it never slows the page down.
  after(() => taskService.recordTaskView(details.task._id, user));
  return sendSuccess(details, 'Task retrieved successfully');
}

export async function createTask({ request }) {
  const input = parseWith(createTaskSchema, await readJsonBody(request));
  const details = await taskService.createTask(input);
  return sendSuccess(details, 'Task created', { status: 201 });
}

export async function updateTask({ request, params }) {
  const input = parseWith(updateTaskSchema, await readJsonBody(request));
  const details = await taskService.updateTask(params.id, input);
  return sendSuccess(details, 'Task updated');
}

export async function deleteTask({ params }) {
  const result = await taskService.deleteTask(params.id);
  return sendSuccess(result, 'Task deleted');
}
