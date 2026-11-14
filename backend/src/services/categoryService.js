import Category from '../models/Category.js';
import Task from '../models/Task.js';
import { ApiError } from '../utils/apiError.js';
import { uniqueSlug } from '../utils/slugify.js';
import { isAdmin } from '../middleware/authMiddleware.js';
import { isObjectId } from './taskQueries.js';

/** Categories in display order, each with the number of active tasks it contains. */
export async function listCategories({ includeInactive }, viewer) {
  const filter = includeInactive && isAdmin(viewer) ? {} : { isActive: true };

  const [categories, counts] = await Promise.all([
    Category.find(filter).sort({ order: 1, name: 1 }),
    Task.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]),
  ]);

  const countById = new Map(counts.map((entry) => [String(entry._id), entry.count]));
  return categories.map((category) => ({
    ...category.toJSON(),
    taskCount: countById.get(String(category._id)) ?? 0,
  }));
}

async function findCategoryOrThrow(id) {
  const category = isObjectId(id) ? await Category.findById(id) : null;
  if (!category) throw ApiError.notFound('Category not found');
  return category;
}

export async function createCategory(input) {
  const slug = await uniqueSlug(Category, input.name);
  return Category.create({ ...input, slug });
}

export async function updateCategory(id, input) {
  const category = await findCategoryOrThrow(id);
  // Slug stays stable so catalogue links (?category=slug) keep working.
  category.set(input);
  await category.save();
  return category;
}

export async function deleteCategory(id) {
  const category = await findCategoryOrThrow(id);
  const taskCount = await Task.countDocuments({ categoryId: category._id });
  if (taskCount > 0) {
    throw ApiError.conflict(
      `Move or delete the ${taskCount} task${taskCount === 1 ? '' : 's'} in this category first`,
    );
  }
  await category.deleteOne();
  return { _id: category._id, name: category.name };
}
