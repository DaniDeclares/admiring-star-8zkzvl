import handler from '../../api-handlers/appointment-response.js';
import { adaptVercelHandler } from './_vercelAdapter.mjs';
export default adaptVercelHandler(handler);
