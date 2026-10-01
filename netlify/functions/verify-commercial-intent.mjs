import handler from '../../api/verify-commercial-intent.js';
import { adaptVercelHandler } from './_vercelAdapter.mjs';

const adapted = adaptVercelHandler(handler);

export default async function verifyCommercialIntent(request) {
  const context = Netlify.env.get('CONTEXT');
  return adapted(request, { netlifyContext: context });
}
