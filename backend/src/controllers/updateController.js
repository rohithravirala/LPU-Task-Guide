import { NextResponse } from 'next/server';
import { openUrlFor } from '@/lib/openUrl';
import { getStudentId, unauthorized } from '@/middleware/authMiddleware';
import { findStudentById, updates } from '@/data/store';

const DAY_MS = 24 * 60 * 60 * 1000;

// MODULE 1 – "Your updates" on the dashboard
// GET /api/updates
// A real version would read the student's deadlines and messages from UMS, LPU Live,
// CodeTantra ... through an official API. LPU has no public API, so these are
// SAMPLE updates from src/data/content.js, each linked to the task that handles it.
export async function getUpdates(request) {
  const studentId = getStudentId(request);
  if (!studentId || !findStudentById(studentId)) return unauthorized();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const data = updates.map(({ _id, kind, title, detail, dueInDays, task }) => ({
    _id,
    kind,
    title,
    detail,
    dueInDays: dueInDays ?? null,
    dueDate: dueInDays == null ? null : new Date(today.getTime() + dueInDays * DAY_MS),
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
