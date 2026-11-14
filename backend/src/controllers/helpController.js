import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getStudentId, unauthorized } from '@/middleware/authMiddleware';
import FAQ from '@/models/FAQ';
import UniversityService from '@/models/UniversityService';

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// MODULE 3 – Student Guidance and Help
// GET /api/faqs?search=login      -> FAQs matching the search
// GET /api/faqs?taskId=<task id>  -> FAQs about one task (shown on its journey page)
export async function getFaqs(request) {
  if (!getStudentId(request)) return unauthorized();

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const taskId = searchParams.get('taskId') || '';

    const filter = {};
    if (/^[a-f\d]{24}$/i.test(taskId)) filter.task = taskId;
    if (search) {
      const pattern = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ question: pattern }, { answer: pattern }, { keywords: pattern }, { category: pattern }];
    }

    const faqs = await FAQ.find(filter).sort({ category: 1, question: 1 }).lean();
    return NextResponse.json({ success: true, message: `${faqs.length} FAQs found`, data: faqs });
  } catch (error) {
    console.error('Could not load FAQs:', error.message);
    return NextResponse.json({ success: false, message: 'Could not load FAQs' }, { status: 500 });
  }
}

// GET /api/services -> every university service: the portals first (UMS, LPU Live ...), then offices
export async function getServices(request) {
  if (!getStudentId(request)) return unauthorized();

  try {
    await connectDB();
    const services = await UniversityService.find().sort({ isPortal: -1, order: 1, type: 1, name: 1 }).lean();
    return NextResponse.json({ success: true, message: `${services.length} services found`, data: services });
  } catch (error) {
    console.error('Could not load services:', error.message);
    return NextResponse.json({ success: false, message: 'Could not load services' }, { status: 500 });
  }
}
