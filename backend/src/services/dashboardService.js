import Task from '../models/Task.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import TaskView from '../models/TaskView.js';
import { TASK_LIST_POPULATE, TASK_LIST_SELECT } from './taskQueries.js';

/**
 * Real counts for the student dashboard (no placeholder statistics).
 * Journey/progress widgets are added by Module 2 Part 2.
 */
export async function getDashboardSummary(user) {
  const [tasks, categories, services, verifiedServices, tasksExplored, lastView, featured] =
    await Promise.all([
      Task.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true, verificationStatus: 'verified' }),
      TaskView.countDocuments({ studentId: user._id }),
      TaskView.findOne({ studentId: user._id }).sort({ lastViewedAt: -1 }).select('lastViewedAt'),
      Task.find({ isActive: true, isFeatured: true })
        .select(TASK_LIST_SELECT)
        .sort({ viewerCount: -1, title: 1 })
        .limit(4)
        .populate(TASK_LIST_POPULATE),
    ]);

  return {
    stats: {
      tasks,
      categories,
      services,
      verifiedServices,
      tasksExplored,
      lastActivityAt: lastView?.lastViewedAt ?? null,
    },
    featured,
  };
}
