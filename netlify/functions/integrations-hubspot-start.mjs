import handler from "../../../api/integrations/hubspot/start.js";
import { runLegacyHandler } from "../_shared/legacyAdapter.mjs";
export default (request, context) => runLegacyHandler(request, context, handler);
export const config = { path: "/api/integrations/hubspot/start" };
