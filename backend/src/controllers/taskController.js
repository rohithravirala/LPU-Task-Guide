import { NextResponse } from 'next/server';
import { openUrlFor } from '@/lib/openUrl';
import { categories, portals, tasks } from '@/data/store';

// The portal fields each task in the list needs (the full portal list is sent separately)
function portalSummary(portal) {
  if (!portal) return null;
  const { _id, name, type, slug, shortName, url } = portal;
  return { _id, name, type, slug, shortName, url };
}

// Does the task match any word of the search? Looks at the title, summary, keywords,
// category, menu path and portal name, so "ums" or "codetantra" finds that portal's tasks.
function matches(task, words) {
  const text = [
    task.title,
    task.summary,
    task.category,
    ...task.keywords,
    ...task.menuPath,
    task.portal?.name ?? '',
    task.portal?.shortName ?? '',
  ]
    .join(' ')
    .toLowerCase();
  return words.some((word) => text.includes(word));
}

// MODULE 1 – Task Catalogue
// GET /api/tasks?search=fine&category=Examinations
// Returns every matching task with its portal, its "Open" link and its step count,
// plus all categories and all portals (for the portal tabs).
// PUBLIC: no login needed, so visitors can see which tasks exist before signing in.
// (Step-by-step guides, FAQs and updates still need a login.)
export async function getTasks(request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const category = (searchParams.get('category') || '').trim();

  // Match any word of the search with 3+ letters (or the whole search if it is short)
  const words = search.split(/\s+/).filter((word) => word.length >= 3);
  const searchWords = words.length ? words : [search];

  const found = tasks
    .filter((task) => !category || task.category === category)
    .filter((task) => !search || matches(task, searchWords))
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title))
    .map(({ steps, ...task }) => ({
      ...task,
      portal: portalSummary(task.portal),
      openUrl: openUrlFor(task),
      stepCount: steps.length,
      services: [...new Set(steps.map((step) => step.service?.name).filter(Boolean))],
    }));

  return NextResponse.json({
    success: true,
    message: `${found.length} tasks found`,
    data: {
      tasks: found,
      categories,
      portals: portals.map(({ _id, name, type, slug, shortName, description, url, openHint, alternateUrl, alternateLabel }) => ({
        _id, name, type, slug, shortName, description, url, openHint, alternateUrl, alternateLabel,
      })),
    },
  });
}
