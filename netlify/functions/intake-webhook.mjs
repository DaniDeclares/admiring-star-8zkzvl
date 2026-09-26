import handler from "../../api/intake-webhook.js";
import { runLegacyHandler } from "./_shared/legacyAdapter.mjs";

export default (request, context) => runLegacyHandler(request, context, handler);

export const config = { path: "/api/intake-webhook" };
