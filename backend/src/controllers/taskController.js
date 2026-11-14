import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { openUrlFor } from '@/lib/openUrl';
import Task from '@/models/Task';
import TaskStep from '@/models/TaskStep';
import UniversityService from '@/models/UniversityService';

// Makes user text safe to use inside a regular expression ("c++" -> "c\+\+")
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// The portal fields the task list needs (the full portal list is sent separately)
const PORTAL_FIELDS = 'name type slug shortName url';

// MODULE 1 – Task Catalogue
// GET /api/tasks?search=fine&category=Examinations
// Returns every matching task with its portal, its "Open" link and its step count,
// plus all categories and all portals (for the portal tabs).
// PUBLIC: no login needed, so visitors can see which tasks exist before signing up.
// (Step-by-step guides, FAQs and updates still need a login.)
export async function getTasks(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const category = (searchParams.get('category') || '').trim();

    const services = await UniversityService.find().sort({ order: 1, name: 1 }).lean();

    const filter = { isActive: true };
    if (category) filter.category = category;

    if (search) {
      // Match any word of the search (3+ letters) in the title, summary, keywords, category or menu path
      const words = search.split(/\s+/).filter((word) => word.length >= 3);
      const patterns = (words.length ? words : [search]).map((word) => new RegExp(escapeRegex(word), 'i'));
      // Searching "ums" or "codetantra" also finds every task of that portal
      const portalIds = services
        .filter((service) => service.isPortal && patterns.some((p) => p.test(service.name) || p.test(service.shortName ?? '')))
        .map((service) => service._id);

      filter.$or = [
        { title: { $in: patterns } },
        { summary: { $in: patterns } },
        { keywords: { $in: patterns } },
        { category: { $in: patterns } },
        { menuPath: { $in: patterns } },
        ...(portalIds.length ? [{ portal: { $in: portalIds } }] : []),
      ];
    }

    const [tasks, stepInfo, categories] = await Promise.all([
      Task.find(filter).sort({ category: 1, title: 1 }).populate('portal', PORTAL_FIELDS).lean(),
      // One query groups all steps by task (for "4 steps · Uses UMS" on each task)
      TaskStep.aggregate([{ $group: { _id: '$task', count: { $sum: 1 }, services: { $addToSet: '$service' } } }]),
      // All categories (not only the filtered ones)
      Task.distinct('category', { isActive: true }),
    ]);

    const serviceName = Object.fromEntries(services.map((service) => [String(service._id), service.name]));
    const infoByTask = Object.fromEntries(stepInfo.map((item) => [String(item._id), item]));

    const tasksWithInfo = tasks.map((task) => {
      const info = infoByTask[String(task._id)];
      return {
        ...task,
        openUrl: openUrlFor(task),
        stepCount: info?.count ?? 0,
        services: (info?.services ?? []).map((id) => serviceName[String(id)]).filter(Boolean),
      };
    });

    const portals = services
      .filter((service) => service.isPortal)
      .map(({ _id, name, type, slug, shortName, description, url, openHint, alternateUrl, alternateLabel }) => ({
        _id, name, type, slug, shortName, description, url, openHint, alternateUrl, alternateLabel,
      }));

    return NextResponse.json({
      success: true,
      message: `${tasks.length} tasks found`,
      data: { tasks: tasksWithInfo, categories: categories.sort(), portals },
    });
  } catch (error) {
    console.error('Could not load tasks:', error.message);
    return NextResponse.json({ success: false, message: 'Could not load tasks' }, { status: 500 });
  }
}
