import { getJourney } from '@/controllers/journeyController';

// GET /api/journeys/:taskId   ([taskId] in the folder name is the dynamic part of the URL)
export async function GET(request, { params }) {
  const { taskId } = await params;
  return getJourney(request, taskId);
}
