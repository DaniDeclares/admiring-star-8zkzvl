import handler from "../../api/verify-commercial-intent.js";
import { runLegacyHandler } from "./_shared/legacyAdapter.mjs";
export default (request, context) => runLegacyHandler(request, context, handler);
export const config = { path: "/api/verify-commercial-intent" };
