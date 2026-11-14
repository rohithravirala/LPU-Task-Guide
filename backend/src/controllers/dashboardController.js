import { sendSuccess } from '../utils/apiResponse.js';
import { getDashboardSummary } from '../services/dashboardService.js';

export async function getDashboard({ user }) {
  const summary = await getDashboardSummary(user);
  return sendSuccess(summary, 'Dashboard retrieved successfully');
}
