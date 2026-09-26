import handler from "../../../api/integrations/quickbooks/callback.js";
import { runLegacyHandler } from "../_shared/legacyAdapter.mjs";
export default (request, context) => runLegacyHandler(request, context, handler);
export const config = { path: "/api/integrations/quickbooks/callback" };
