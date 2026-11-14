import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { openUrlFor } from '@/lib/openUrl';
import { getStudentId, unauthorized } from '@/middleware/authMiddleware';
import Task from '@/models/Task';
import TaskStep from '@/models/TaskStep';
import '@/models/UniversityService'; // registers the model used by populate('portal') and populate('service')

// MODULE 2 – Task Journey Engine
// GET /api/journeys/:taskId  ->  the task + its steps in order, each with its university service
export async function getJourney(request, taskId) {
  if (!getStudentId(request)) return unauthorized();

  // A MongoDB id is 24 hexadecimal characters; anything else cannot be a task
  if (!/^[a-f\d]{24}$/i.test(taskId)) {
    return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
  }

  try {
    await connectDB();
    // populate() replaces an id with the full document it points to
    const [task, steps] = await Promise.all([
      Task.findOne({ _id: taskId, isActive: true }).populate('portal').lean(),
      TaskStep.find({ task: taskId }).sort({ order: 1 }).populate('service').lean(),
    ]);
    if (!task) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    }

    const taskOpenUrl = openUrlFor(task);
    const portalId = task.portal ? String(task.portal._id) : null;

    // Each step's "Open" button: a step on the task's own portal goes to the task's page,
    // any other step goes to that service's home page (if it has a website at all)
    const stepsWithLinks = steps.map((step) => ({
      ...step,
      openUrl: step.service && String(step.service._id) === portalId ? taskOpenUrl : step.service?.url || '',
    }));

    return NextResponse.json({
      success: true,
      message: 'Journey loaded',
      data: { task: { ...task, openUrl: taskOpenUrl }, steps: stepsWithLinks },
    });
  } catch (error) {
    console.error('Could not load journey:', error.message);
    return NextResponse.json({ success: false, message: 'Could not load this journey' }, { status: 500 });
  }
}
