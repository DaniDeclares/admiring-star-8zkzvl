function parseBody(event) {
  if (!event?.body) return {};
  try { return typeof event.body === 'string' ? JSON.parse(event.body) : event.body; }
  catch { return {}; }
}

export function adaptVercelHandler(handler) {
  return async (event) => {
    let statusCode = 200;
    let payload = null;
    const headers = {};
    const req = {
      method: event.httpMethod,
      headers: Object.fromEntries(Object.entries(event.headers || {}).map(([k,v]) => [k.toLowerCase(), v])),
      query: event.queryStringParameters || {},
      body: parseBody(event),
    };
    const res = {
      status(code) { statusCode = code; return res; },
      setHeader(name, value) { headers[name] = String(value); return res; },
      json(value) { payload = value; headers['Content-Type'] = 'application/json'; return res; },
      send(value) { payload = value; return res; },
      end(value = '') { payload = value; return res; },
    };
    await handler(req, res);
    return {
      statusCode,
      headers,
      body: typeof payload === 'string' ? payload : JSON.stringify(payload ?? {}),
    };
  };
}
