import { NextResponse } from 'next/server';
import { openUrlFor } from '@/lib/openUrl';
import { getStudentId, unauthorized } from '@/middleware/authMiddleware';
import { findTask } from '@/data/store';

export async function getJourney(request, { params }) {
  if (!getStudentId(request)) return unauthorized();

  const found = findTask((await params).taskId);
  if (!found) return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });

  const { steps, ...task } = found;
  const openUrl = openUrlFor(task);

  return NextResponse.json({
    success: true,
    message: 'Journey loaded',
    data: {
      task: { ...task, openUrl },
      steps: steps.map((step) => ({
        ...step,
        openUrl: step.service && step.service === task.portal ? openUrl : step.service?.url || '',
      })),
    },
  });
}
