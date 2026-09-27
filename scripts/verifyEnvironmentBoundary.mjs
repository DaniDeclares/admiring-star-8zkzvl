const context = process.env.CONTEXT || process.env.NETLIFY_CONTEXT || "";
const fail = (message) => { console.error("[environment-boundary] " + message); process.exit(1); };
const projectRef = (url) => {
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".supabase.co") ? host.split(".")[0] : "";
  } catch { return ""; }
};
if (context === "production") {
  if (process.env.TESTER_SUPABASE_SECRET_KEY) fail("Tester-only credential is present in Production.");
  const browserRef = projectRef(process.env.REACT_APP_SUPABASE_URL || "");
  const serverRef = projectRef(process.env.SUPABASE_URL || "");
  if (!browserRef || !serverRef) fail("Production Supabase URL configuration is incomplete.");
  if (browserRef !== serverRef) fail("Browser and server Supabase project refs do not match.");
  if (!process.env.REACT_APP_SUPABASE_ANON_KEY || !process.env.SUPABASE_ANON_KEY) fail("Production public API-key configuration is incomplete.");
  if (process.env.REACT_APP_SUPABASE_ANON_KEY !== process.env.SUPABASE_ANON_KEY) fail("Browser and server public API keys do not match.");
}
console.log("[environment-boundary] OK for context: " + (context || "local"));
