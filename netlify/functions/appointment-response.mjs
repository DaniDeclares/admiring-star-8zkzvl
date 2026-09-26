import handler from "../../api/appointment-response.js";
import { runLegacyHandler } from "./_shared/legacyAdapter.mjs";
export default (request, context) => runLegacyHandler(request, context, handler);
export const config = { path: "/api/appointment-response" };
