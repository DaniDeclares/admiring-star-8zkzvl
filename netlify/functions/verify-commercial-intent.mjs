import handler from '../../api-handlers/verify-commercial-intent.js';
import { adaptVercelHandler } from './_vercelAdapter.mjs';

const adapted = adaptVercelHandler(handler);

export default async function verifyCommercialIntent(request, context) {
  return adapted(request, { netlifyContext: context?.deploy?.context || null });
}
