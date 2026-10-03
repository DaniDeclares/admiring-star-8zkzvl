import handler from '../../api-handlers/create-checkout-session.js';
import { adaptVercelHandler } from './_vercelAdapter.mjs';
export default adaptVercelHandler(handler);
