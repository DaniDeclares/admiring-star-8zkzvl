import handler from '../../api-handlers/process-outbox.js';
import { adaptVercelHandler } from './_vercelAdapter.mjs';
export default adaptVercelHandler(handler);
