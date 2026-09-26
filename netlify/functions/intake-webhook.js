import apiHandler from '../../api/intake-webhook.js';
import { adaptVercelHandler } from './_vercelAdapter.js';

export default adaptVercelHandler(apiHandler);

export const config = {
  path: '/api/intake-webhook',
};
