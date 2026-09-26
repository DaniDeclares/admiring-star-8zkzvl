import apiHandler from '../../api/verify-commercial-intent.js';
import { adaptVercelHandler } from './_vercelAdapter.js';

export default adaptVercelHandler(apiHandler);

export const config = {
  path: '/api/verify-commercial-intent',
};
