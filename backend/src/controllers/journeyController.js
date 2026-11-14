import { NextResponse } from 'next/server';
import { openUrlFor } from '@/lib/openUrl';
import { getStudentId, unauthorized } from '@/middleware/authMiddleware';
import { findTask } from '@/data/store';

// MODULE 2 – Task Journey Engine
// GET /api/journeys/:taskId  ->  the task + its steps in order, each with its university service
export async function getJourney(request, taskId) {
  if (!getStudentId(request)) return unauthorized();

  const found = findTask(taskId);
  if (!found) {
    return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
  }

  const { steps, ...task } = found;
  const taskOpenUrl = openUrlFor(task);

  // Each step's "Open" button: a step on the task's own portal goes to the task's page,
  // any other step goes to that service's home page (if it has a website at all)
  const stepsWithLinks = steps.map((step) => ({
    ...step,
    openUrl: step.service && step.service._id === task.portal?._id ? taskOpenUrl : step.service?.url || '',
  }));

  return NextResponse.json({
    success: true,
    message: 'Journey loaded',
    data: { task: { ...task, openUrl: taskOpenUrl }, steps: stepsWithLinks },
  });
}
