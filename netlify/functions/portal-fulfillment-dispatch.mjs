import handler from '../../api/portal-fulfillment-dispatch.js';
import { adaptVercelHandler } from './_vercelAdapter.mjs';
export default adaptVercelHandler(handler);
