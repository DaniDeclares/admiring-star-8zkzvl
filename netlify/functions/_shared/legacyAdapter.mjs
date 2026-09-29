// Netlify compatibility adapter for existing Vercel-style API handlers.
// This keeps business logic in api/* and only translates Request/Response.
import { Buffer } from "node:buffer";

function parseBody(req, raw) {
  const type = req.headers.get("content-type") || "";
  if (!raw) return undefined;
  if (type.includes("application/json")) {
    try { return JSON.parse(raw); } catch { return undefined; }
  }
  return raw;
}

function createNodeLikeReq(request, context, body) {
  const url = new URL(request.url);
  const headers = {};
  request.headers.forEach((v,k)=>{ headers[k.toLowerCase()] = v; });
  return {
    method: request.method,
    url: url.pathname + url.search,
    headers,
    query: Object.fromEntries(url.searchParams.entries()),
    body,
    socket: { remoteAddress: context?.ip || null },
  };
}

function createNodeLikeRes() {
  let statusCode = 200;
  const headers = new Headers();
  let responseBody = "";
  let ended = false;
  const res = {
    status(code){ statusCode = code; return res; },
    setHeader(name,value){ headers.set(name,String(value)); return res; },
    getHeader(name){ return headers.get(name); },
    json(value){ headers.set("content-type","application/json; charset=utf-8"); responseBody = JSON.stringify(value); ended = true; return res; },
    send(value){
      if (typeof value === "object" && value !== null && !Buffer.isBuffer(value)) {
        headers.set("content-type","application/json; charset=utf-8");
        responseBody = JSON.stringify(value);
      } else responseBody = value == null ? "" : String(value);
      ended = true; return res;
    },
    end(value=""){ responseBody = value == null ? "" : String(value); ended = true; return res; },
    redirect(codeOrUrl, maybeUrl){
      const code = typeof codeOrUrl === "number" ? codeOrUrl : 302;
      const location = typeof codeOrUrl === "number" ? maybeUrl : codeOrUrl;
      statusCode = code; headers.set("location", location); ended = true; return res;
    },
    get _result(){ return {statusCode,headers,responseBody,ended}; }
  };
  return res;
}

export async function runLegacyHandler(request, context, handler) {
  const raw = request.method === "GET" || request.method === "HEAD" ? "" : await request.text();
  const req = createNodeLikeReq(request, context, parseBody(request, raw));
  const res = createNodeLikeRes();
  await handler(req,res);
  const out = res._result;
  return new Response(out.responseBody, { status: out.statusCode, headers: out.headers });
}
