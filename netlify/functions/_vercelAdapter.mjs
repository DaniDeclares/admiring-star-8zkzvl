export function adaptVercelHandler(handler) {
  return async function netlifyHandler(request, runtime = {}) {
    const url = new URL(request.url);
    let rawBody = '';
    let body = {};
    if (!['GET','HEAD'].includes(request.method)) {
      rawBody = await request.text();
      if (rawBody) {
        try { body = JSON.parse(rawBody); } catch { body = rawBody; }
      }
    }
    const req = {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      query: Object.fromEntries(url.searchParams.entries()),
      url: url.pathname + url.search,
      netlifyContext: runtime.netlifyContext || null,
      // Stripe verifies the exact request bytes. Vercel supplies an async
      // iterable request while Netlify supplies a Web Request, so preserve
      // the unparsed bytes behind the same interface instead of weakening
      // webhook signature verification.
      async *[Symbol.asyncIterator]() {
        if (rawBody) yield Buffer.from(rawBody);
      }
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
