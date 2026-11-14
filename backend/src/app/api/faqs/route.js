import { getFaqs } from '@/controllers/helpController';

// GET /api/faqs
export async function GET(request) {
  return getFaqs(request);
}
