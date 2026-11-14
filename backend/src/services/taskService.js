import Task from '../models/Task.js';
import TaskStep from '../models/TaskStep.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import TaskView from '../models/TaskView.js';
import { ApiError } from '../utils/apiError.js';
import { uniqueSlug } from '../utils/slugify.js';
import { escapeRegex, normaliseQuery, rankTasks, relatedTermsFor, tokenize } from '../utils/search.js';
import { isAdmin, isStudent } from '../middleware/authMiddleware.js';
import {
  CATEGORY_FIELDS,
  SERVICE_DETAIL_FIELDS,
  SERVICE_SUMMARY_FIELDS,
  TASK_LIST_POPULATE,
  TASK_LIST_SELECT,
  collectServices,
  findTaskOrThrow,
  isObjectId,
  summariseSteps,
} from './taskQueries.js';

const SORTS = {
  recommended: { isFeatured: -1, viewerCount: -1, title: 1 },
  popular: { viewerCount: -1, title: 1 },
  title: { title: 1 },
  updated: { updatedAt: -1 },
};

const ADMIN_VIEWER = { role: 'admin' };

async function resolveCategoryId(ref) {
  if (!ref) return null;
  const filter = isObjectId(ref) ? { _id: ref } : { slug: ref.toLowerCase() };
  const category = await Category.findOne(filter).select('_id');
  if (!category) throw ApiError.notFound('Category not found');
  return category._id;
}

function toListItem(task) {
  const json = task.toJSON();
  delete json.description;
  delete json.purpose;
  delete json.importantNotes;
  return json;
}

/* ------------------------------------------------------------------ reads */

export async function listTasks({ category, sort, page, limit, featured, includeInactive }, viewer) {
  const filter = {};
  if (!(includeInactive && isAdmin(viewer))) filter.isActive = true;
  if (category) filter.categoryId = await resolveCategoryId(category);
  if (featured !== undefined) filter.isFeatured = featured;

  const query = Task.find(filter)
    .select(TASK_LIST_SELECT)
    .sort(SORTS[sort] ?? SORTS.recommended)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(TASK_LIST_POPULATE);
  if (sort === 'title') query.collation({ locale: 'en' });

  const [items, total] = await Promise.all([query, Task.countDocuments(filter)]);
  return {
    items,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function getTaskDetails(ref, viewer) {
  const task = await findTaskOrThrow(ref, viewer);
  await task.populate([
    { path: 'category', select: CATEGORY_FIELDS },
    { path: 'primaryService', select: SERVICE_DETAIL_FIELDS },
  ]);

  const [steps, related] = await Promise.all([
    TaskStep.find({ taskId: task._id })
      .sort({ order: 1 })
      .select('order title description isRequired serviceId')
      .populate({ path: 'service', select: SERVICE_SUMMARY_FIELDS }),
    Task.find({ _id: { $ne: task._id }, categoryId: task.categoryId, isActive: true })
      .sort({ viewerCount: -1, title: 1 })
      .limit(4)
      .select('title slug summary estimatedDuration categoryId')
      .populate([{ path: 'stepCount' }, { path: 'category', select: 'name slug code' }]),
  ]);

  return {
    task,
    steps,
    services: collectServices(task.primaryService, steps),
    summary: summariseSteps(steps),
    related,
  };
}

export async function searchTasks({ q, category, limit }) {
  const query = normaliseQuery(q);
  const terms = tokenize(query);
  const empty = { items: [], total: 0, query, relatedTerms: [], matchedCategories: [] };
  if (!terms.length) return empty;

  const related = relatedTermsFor(terms);
  const allTerms = [...terms, ...[...related.values()].flat()];
  const patterns = allTerms.map((term) => new RegExp(escapeRegex(term), 'i'));

  const [categoryFilter, matchedCategories] = await Promise.all([
    category ? resolveCategoryId(category) : null,
    Category.find({
      isActive: true,
      $or: [
        { name: { $in: terms.map((term) => new RegExp(escapeRegex(term), 'i')) } },
        { code: { $in: terms.map((term) => term.toUpperCase()) } },
      ],
    }).select('name slug code'),
  ]);

  const or = [
    { title: { $in: patterns } },
    { summary: { $in: patterns } },
    { keywords: { $in: patterns } },
    { description: { $in: patterns } },
  ];
  if (matchedCategories.length) {
    or.push({ categoryId: { $in: matchedCategories.map((item) => item._id) } });
  }

  const filter = { isActive: true, $or: or };
  if (categoryFilter) filter.categoryId = categoryFilter;

  const candidates = await Task.find(filter)
    .select('-purpose -importantNotes')
    .sort({ viewerCount: -1 })
    .limit(200)
    .populate(TASK_LIST_POPULATE);

  const ranked = rankTasks(candidates, { query, terms, related });

  return {
    items: ranked.slice(0, limit).map((result) => toListItem(result.task)),
    total: ranked.length,
    query,
    relatedTerms: [...new Set([...related.values()].flat())],
    matchedCategories,
  };
}

export async function getPopularTasks({ limit }) {
  return Task.find({ isActive: true, viewerCount: { $gt: 0 } })
    .select(TASK_LIST_SELECT)
    .sort({ viewerCount: -1, title: 1 })
    .limit(limit)
    .populate(TASK_LIST_POPULATE);
}

export async function getRecentTasks(viewer, { limit }) {
  // Over-fetch a little: some recently viewed tasks may have been deactivated since.
  const views = await TaskView.find({ studentId: viewer._id })
    .sort({ lastViewedAt: -1 })
    .limit(limit * 2)
    .populate({ path: 'task', select: TASK_LIST_SELECT, populate: TASK_LIST_POPULATE });

  return views
    .filter((view) => view.task?.isActive)
    .slice(0, limit)
    .map((view) => ({ task: view.task, lastViewedAt: view.lastViewedAt, viewCount: view.viewCount }));
}

// Opening the details page and then the journey (or refreshing) within this window
// counts as one visit.
const VISIT_WINDOW_MS = 30 * 60 * 1000;

/**
 * Remembers that a student opened a task. `lastViewedAt` is refreshed on every open
 * ("Recently opened"); `viewCount` only grows once per visit window. The first view by
 * a student also bumps Task.viewerCount (distinct students), which drives "Popular".
 * Admin views are not recorded so popularity reflects students only.
 */
export async function recordTaskView(taskId, viewer) {
  if (!isStudent(viewer)) return;
  const now = new Date();
  const filter = { studentId: viewer._id, taskId };

  try {
    // 1. Count a new visit if the previous one is older than the window.
    const counted = await TaskView.updateOne(
      { ...filter, lastViewedAt: { $lt: new Date(now.getTime() - VISIT_WINDOW_MS) } },
      { $inc: { viewCount: 1 }, $set: { lastViewedAt: now } },
    );
    if (counted.matchedCount > 0) return;

    // 2. Otherwise refresh a recent visit, or create the first view.
    const result = await TaskView.updateOne(
      filter,
      { $set: { lastViewedAt: now }, $setOnInsert: { viewCount: 1 } },
      { upsert: true },
    );
    if (result.upsertedCount > 0) {
      await Task.updateOne({ _id: taskId }, { $inc: { viewerCount: 1 } });
    }
  } catch (error) {
    // A duplicate key means a parallel request recorded the first view already.
    if (error?.code !== 11000) console.error('[tasks] Could not record task view:', error);
  }
}

/* ----------------------------------------------------------------- writes */

/** Checks that referenced category/services exist; reports problems per form field. */
async function assertReferences({ categoryId, primaryServiceId, steps }) {
  const errors = {};

  if (categoryId && !(await Category.exists({ _id: categoryId }))) {
    errors.categoryId = 'Choose an existing category';
  }

  const serviceIds = new Set(
    [primaryServiceId, ...(steps ?? []).map((step) => step.serviceId)].filter(Boolean).map(String),
  );
  if (serviceIds.size) {
    const found = await Service.find({ _id: { $in: [...serviceIds] } }).select('_id');
    const known = new Set(found.map((service) => String(service._id)));
    if (primaryServiceId && !known.has(String(primaryServiceId))) {
      errors.primaryServiceId = 'Choose an existing service';
    }
    steps?.forEach((step, index) => {
      if (step.serviceId && !known.has(String(step.serviceId))) {
        errors[`steps.${index}.serviceId`] = 'Choose an existing service';
      }
    });
  }

  if (Object.keys(errors).length) {
    throw ApiError.badRequest('Please check the highlighted fields', errors);
  }
}

function toStepDocument(step, taskId, index) {
  return {
    taskId,
    order: index + 1,
    title: step.title,
    description: step.description ?? '',
    instructions: step.instructions ?? [],
    serviceId: step.serviceId ?? null,
    isRequired: step.isRequired ?? true,
    prerequisites: step.prerequisites ?? [],
    additionalNotes: step.additionalNotes ?? '',
    checklist: step.checklist ?? [],
  };
}

/**
 * Makes the stored steps match `steps` (in order). Existing steps keep their ids so
 * that student progress referencing them stays valid; new steps are inserted and
 * steps missing from the list are removed.
 */
async function syncSteps(taskId, steps) {
  const existing = await TaskStep.find({ taskId }).select('_id');
  const existingIds = new Set(existing.map((step) => String(step._id)));
  const kept = new Set();

  const operations = steps.map((step, index) => {
    const document = toStepDocument(step, taskId, index);
    if (step._id && existingIds.has(step._id) && !kept.has(step._id)) {
      kept.add(step._id);
      return { updateOne: { filter: { _id: step._id, taskId }, update: { $set: document } } };
    }
    return { insertOne: { document } };
  });

  const removed = [...existingIds].filter((id) => !kept.has(id));
  if (removed.length) {
    operations.push({ deleteMany: { filter: { taskId, _id: { $in: removed } } } });
  }

  await TaskStep.bulkWrite(operations, { ordered: true });
}

export async function createTask(input) {
  const { steps, ...fields } = input;
  await assertReferences({ ...fields, steps });

  const slug = await uniqueSlug(Task, fields.title);
  const task = await Task.create({ ...fields, slug });

  try {
    await TaskStep.insertMany(steps.map((step, index) => toStepDocument(step, task._id, index)));
  } catch (error) {
    // Standalone MongoDB has no multi-document transactions, so undo manually.
    await Task.deleteOne({ _id: task._id });
    throw error;
  }

  return getTaskDetails(String(task._id), ADMIN_VIEWER);
}

export async function updateTask(ref, input) {
  const task = await findTaskOrThrow(ref, ADMIN_VIEWER);
  const { steps, ...fields } = input;
  await assertReferences({ ...fields, steps });

  // The slug is intentionally not regenerated when the title changes (stable links).
  task.set(fields);
  await task.save();
  if (steps) await syncSteps(task._id, steps);

  return getTaskDetails(String(task._id), ADMIN_VIEWER);
}

export async function deleteTask(ref) {
  const task = await findTaskOrThrow(ref, ADMIN_VIEWER);
  const [stepResult] = await Promise.all([
    TaskStep.deleteMany({ taskId: task._id }),
    TaskView.deleteMany({ taskId: task._id }),
  ]);
  await task.deleteOne();

  return { _id: task._id, title: task.title, deletedSteps: stepResult.deletedCount };
}
