import { NextResponse } from 'next/server';
import { openUrlFor } from '@/lib/openUrl';
import { categories, portals, tasks } from '@/data/store';

function portalSummary({ _id, name, type, slug, shortName, url }) {
  return { _id, name, type, slug, shortName, url };
}

export async function getTasks(request) {
  const search = (new URL(request.url).searchParams.get('search') || '').trim().toLowerCase();
  const words = search.split(/\s+/).filter((word) => word.length >= 3);
  const searchWords = words.length ? words : [search];

  const found = tasks
    .filter((task) => {
      const { title, summary, category, keywords, menuPath, portal } = task;
      const text = [title, summary, category, ...keywords, ...menuPath, portal?.name, portal?.shortName].join(' ').toLowerCase();
      return searchWords.some((word) => text.includes(word));
    })
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title))
    .map(({ steps, ...task }) => ({
      ...task,
      portal: task.portal && portalSummary(task.portal),
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
      portals: portals.map(({ isPortal, order, menuHint, ...portal }) => portal),
    },
  });
}
