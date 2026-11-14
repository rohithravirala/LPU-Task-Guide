import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { openUrlFor } from '@/lib/openUrl';
import { getStudentId, unauthorized } from '@/middleware/authMiddleware';
import DemoUpdate from '@/models/DemoUpdate';
import Student from '@/models/Student';
import '@/models/Task'; // registers the models used by populate()
import '@/models/UniversityService';

const DAY_MS = 24 * 60 * 60 * 1000;

// MODULE 1 – "Your updates" on the dashboard
// GET /api/updates
// A real version would read the student's deadlines and messages from UMS, LPU Live,
// CodeTantra ... through an official API. LPU has no public API, so only the demo
// account gets SAMPLE updates (from seedData.js); every other student gets none.
export async function getUpdates(request) {
  const studentId = getStudentId(request);
  if (!studentId) return unauthorized();

  try {
    await connectDB();
    const student = await Student.findById(studentId).select('isDemo').lean();
    if (!student?.isDemo) {
      return NextResponse.json({
        success: true,
        message: 'Live updates need an official LPU API',
        data: { isDemo: false, updates: [] },
      });
    }

    // Each update with its task, and the task's portal (for the badge and the Open link)
    const updates = await DemoUpdate.find()
      .sort({ order: 1 })
      .populate({
        path: 'task',
        select: 'title url menuPath portal isActive',
        populate: { path: 'portal', select: 'name type slug shortName url' },
      })
      .lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = updates
      .filter((update) => update.task?.isActive)
      .map(({ _id, kind, title, detail, dueInDays, task }) => ({
        _id,
        kind,
        title,
        detail,
        dueInDays: dueInDays ?? null,
        dueDate: dueInDays == null ? null : new Date(today.getTime() + dueInDays * DAY_MS),
        task: { _id: task._id, title: task.title, menuPath: task.menuPath, portal: task.portal, openUrl: openUrlFor(task) },
      }));

    return NextResponse.json({
      success: true,
      message: `${data.length} sample updates`,
      data: { isDemo: true, updates: data },
    });
  } catch (error) {
    console.error('Could not load updates:', error.message);
    return NextResponse.json({ success: false, message: 'Could not load updates' }, { status: 500 });
  }
}
