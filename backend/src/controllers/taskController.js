import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getStudentId, unauthorized } from '@/middleware/authMiddleware';
import Task from '@/models/Task';
import TaskStep from '@/models/TaskStep';
import UniversityService from '@/models/UniversityService';

// Makes user text safe to use inside a regular expression ("c++" -> "c\+\+")
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// MODULE 1 – Task Catalogue
// GET /api/tasks?search=fine&category=Examinations
export async function getTasks(request) {
  if (!getStudentId(request)) return unauthorized();

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const category = (searchParams.get('category') || '').trim();

    const filter = { isActive: true };
    if (category) filter.category = category;

    if (search) {
      // Match any word of the search (3+ letters) in the title, summary, keywords or category
      const words = search.split(/\s+/).filter((word) => word.length >= 3);
      const patterns = (words.length ? words : [search]).map((word) => new RegExp(escapeRegex(word), 'i'));
      filter.$or = [
        { title: { $in: patterns } },
        { summary: { $in: patterns } },
        { keywords: { $in: patterns } },
        { category: { $in: patterns } },
      ];
    }

    const tasks = await Task.find(filter).sort({ category: 1, title: 1 }).lean();

    // For every task: how many steps it has, and which services those steps use.
    // One query groups all steps by task (for "4 steps · Uses UMS" on each card).
    const stepInfo = await TaskStep.aggregate([
      { $group: { _id: '$task', count: { $sum: 1 }, services: { $addToSet: '$service' } } },
    ]);
    const services = await UniversityService.find().select('name').lean();
    const serviceName = Object.fromEntries(services.map((service) => [String(service._id), service.name]));
    const infoByTask = Object.fromEntries(stepInfo.map((item) => [String(item._id), item]));

    const tasksWithCounts = tasks.map((task) => {
      const info = infoByTask[String(task._id)];
      return {
        ...task,
        stepCount: info?.count ?? 0,
        services: (info?.services ?? []).map((id) => serviceName[String(id)]).filter(Boolean),
      };
    });

    // All categories (not only the filtered ones) for the category buttons
    const categories = await Task.distinct('category', { isActive: true });

    return NextResponse.json({
      success: true,
      message: `${tasks.length} tasks found`,
      data: { tasks: tasksWithCounts, categories: categories.sort() },
    });
  } catch (error) {
    console.error('Could not load tasks:', error.message);
    return NextResponse.json({ success: false, message: 'Could not load tasks' }, { status: 500 });
  }
}
