import handler from '../../api-handlers/stripe-webhook.js';
import { adaptVercelHandler } from './_vercelAdapter.mjs';
export default adaptVercelHandler(handler);
