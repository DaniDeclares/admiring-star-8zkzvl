export function adaptVercelHandler(handler) {
  return async function netlifyHandler(request) {
    const url = new URL(request.url);
    let body = {};
    if (!['GET','HEAD'].includes(request.method)) {
      const text = await request.text();
      if (text) {
        try { body = JSON.parse(text); } catch { body = text; }
      }
    }
    const req = {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      query: Object.fromEntries(url.searchParams.entries()),
      url: url.pathname + url.search
    };
    let statusCode = 200;
    const responseHeaders = { 'content-type': 'application/json; charset=utf-8' };
    let payload = null;
    const res = {
      status(code) { statusCode = code; return this; },
      setHeader(name, value) { responseHeaders[String(name).toLowerCase()] = String(value); return this; },
      json(value) { payload = JSON.stringify(value); return this; },
      send(value) { payload = typeof value === 'string' ? value : JSON.stringify(value); return this; },
      end(value='') { payload = String(value); return this; }
    };
    await handler(req, res);
    return new Response(payload ?? '', { status: statusCode, headers: responseHeaders });
  };
}
