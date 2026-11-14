import { getSearchParams } from '../lib/apiHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parseWith, queryFlag } from '../validators/common.js';
import * as serviceService from '../services/serviceService.js';
import * as z from 'zod';

const listQuerySchema = z.object({ includeInactive: queryFlag });

export async function getServices({ request, user }) {
  const query = parseWith(listQuerySchema, getSearchParams(request));
  const services = await serviceService.listServices(query, user);
  return sendSuccess(services, 'Services retrieved successfully');
}

export async function getService({ params, user }) {
  const details = await serviceService.getServiceDetails(params.id, user);
  return sendSuccess(details, 'Service retrieved successfully');
}
