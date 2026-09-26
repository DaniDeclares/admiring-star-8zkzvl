function parseBody(rawBody) {
  if (!rawBody) return {};
  try { return JSON.parse(rawBody); } catch { return {}; }
}

function toLegacyRequest(request, body) {
  const url = new URL(request.url);
  return {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    query: Object.fromEntries(url.searchParams.entries()),
    body,
  };
}

async function runLegacyHandler(handler, request) {
  let statusCode = 200;
  let payload = null;
  const headers = {};
  const rawBody = ['GET','HEAD'].includes(request.method) ? '' : await request.text();
  const req = toLegacyRequest(request, parseBody(rawBody));
  const res = {
    status(code) { statusCode = code; return res; },
    setHeader(name, value) { headers[name] = String(value); return res; },
    json(value) { payload = value; headers['Content-Type'] = 'application/json'; return res; },
    send(value) { payload = value; return res; },
    end(value = '') { payload = value; return res; },
  };
  await handler(req, res);
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload ?? {});
  return new Response(body, { status: statusCode, headers });
}

export function adaptVercelHandler(handler) {
  return (request) => runLegacyHandler(handler, request);
}
