import handler from "../../../api/integrations/google/start.js";
import { runLegacyHandler } from "../_shared/legacyAdapter.mjs";
export default (request, context) => runLegacyHandler(request, context, handler);
export const config = { path: "/api/integrations/google/start" };
