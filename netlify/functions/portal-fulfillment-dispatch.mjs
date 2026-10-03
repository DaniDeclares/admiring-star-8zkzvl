import handler from '../../api-handlers/portal-fulfillment-dispatch.js';
import { adaptVercelHandler } from './_vercelAdapter.mjs';
export default adaptVercelHandler(handler);
