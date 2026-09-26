import apiHandler from '../../api/intake-webhook.js';
import { adaptVercelHandler } from './_vercelAdapter.js';
export const handler = adaptVercelHandler(apiHandler);
