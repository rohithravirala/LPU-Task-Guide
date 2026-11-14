import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getStudentId, unauthorized } from '@/middleware/authMiddleware';
import Task from '@/models/Task';
import TaskStep from '@/models/TaskStep';
import '@/models/UniversityService'; // registers the model used by populate('service')

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
    const task = await Task.findOne({ _id: taskId, isActive: true }).lean();
    if (!task) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    }

    // populate('service') replaces the service id with the full service document
    const steps = await TaskStep.find({ task: taskId }).sort({ order: 1 }).populate('service').lean();

    return NextResponse.json({ success: true, message: 'Journey loaded', data: { task, steps } });
  } catch (error) {
    console.error('Could not load journey:', error.message);
    return NextResponse.json({ success: false, message: 'Could not load this journey' }, { status: 500 });
  }
}
