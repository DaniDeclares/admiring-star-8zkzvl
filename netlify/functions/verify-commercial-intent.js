import handler from '../../api/verify-commercial-intent.js';
import { adaptVercelHandler } from './_vercelAdapter.js';
export const netlifyHandler = adaptVercelHandler(handler);
export { netlifyHandler as handler };
