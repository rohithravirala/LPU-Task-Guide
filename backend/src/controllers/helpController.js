import { NextResponse } from 'next/server';
import { getStudentId, unauthorized } from '@/middleware/authMiddleware';
import { faqs, services } from '@/data/store';

// MODULE 3 – Student Guidance and Help
// GET /api/faqs?search=login      -> FAQs matching the search
// GET /api/faqs?taskId=<task id>  -> FAQs about one task (shown on its journey page)
export async function getFaqs(request) {
  if (!getStudentId(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const taskId = searchParams.get('taskId') || '';

  const found = faqs
    .filter((faq) => !taskId || faq.task === taskId)
    .filter((faq) => !search || [faq.question, faq.answer, faq.category, ...faq.keywords].join(' ').toLowerCase().includes(search));

  return NextResponse.json({ success: true, message: `${found.length} FAQs found`, data: found });
}

// GET /api/services -> every university service: the portals first (UMS, LPU Live ...), then offices
export async function getServices(request) {
  if (!getStudentId(request)) return unauthorized();

  const sorted = [...services].sort(
    (a, b) =>
      Number(Boolean(b.isPortal)) - Number(Boolean(a.isPortal)) ||
      (a.order ?? 0) - (b.order ?? 0) ||
      a.type.localeCompare(b.type) ||
      a.name.localeCompare(b.name),
  );
  return NextResponse.json({ success: true, message: `${sorted.length} services found`, data: sorted });
}
