import handler from "../../api/create-checkout-session.js";
import { runLegacyHandler } from "./_shared/legacyAdapter.mjs";
export default (request, context) => runLegacyHandler(request, context, handler);
export const config = { path: "/api/create-checkout-session" };
