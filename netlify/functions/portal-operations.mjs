import handler from '../../api-handlers/portal-operations.js';
import { adaptVercelHandler } from './_vercelAdapter.mjs';
export default adaptVercelHandler(handler);
