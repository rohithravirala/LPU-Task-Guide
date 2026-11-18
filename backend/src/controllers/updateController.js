import { NextResponse } from 'next/server';
import { openUrlFor } from '@/lib/openUrl';
import { getStudentId, unauthorized } from '@/middleware/authMiddleware';
import { findStudentById, updates } from '@/data/store';

export async function getUpdates(request) {
  if (!findStudentById(getStudentId(request))) return unauthorized();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const data = updates.map(({ task, dueInDays = null, ...update }) => ({
    ...update,
    dueInDays,
    dueDate: dueInDays === null ? null : new Date(today.getTime() + dueInDays * 24 * 60 * 60 * 1000),
    task: {
      _id: task._id,
      title: task.title,
      menuPath: task.menuPath,
      portal: task.portal && { _id: task.portal._id, name: task.portal.name, type: task.portal.type, slug: task.portal.slug, shortName: task.portal.shortName },
      openUrl: openUrlFor(task),
    },
  }));

  return NextResponse.json({ success: true, message: `${data.length} sample updates`, data: { updates: data } });
}
