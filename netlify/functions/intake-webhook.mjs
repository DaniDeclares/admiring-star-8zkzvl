import handler from '../../api/intake-webhook.js';
import { adaptVercelHandler } from './_vercelAdapter.mjs';
export default adaptVercelHandler(handler);
