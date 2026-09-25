import apiHandler from '../../api/verify-commercial-intent.js';

function makeReq(event) {
  const headers = Object.fromEntries(Object.entries(event.headers || {}).map(([k,v]) => [k.toLowerCase(), v]));
  const query = event.queryStringParameters || {};
  let body = {};
  if (event.body) {
    try { body = event.isBase64Encoded ? JSON.parse(Buffer.from(event.body,'base64').toString('utf8')) : JSON.parse(event.body); }
    catch { body = event.body; }
  }
  return { method: event.httpMethod, headers, query, body, url: event.rawUrl || event.path };
}
function makeRes() {
  let statusCode=200, payload='', headers={'content-type':'application/json; charset=utf-8'};
  return {
    status(code){statusCode=code;return this;},
    setHeader(name,value){headers[String(name).toLowerCase()]=String(value);},
    json(value){payload=JSON.stringify(value);return this;},
    send(value){payload=typeof value==='string'?value:JSON.stringify(value);return this;},
    end(value=''){payload=String(value);return this;},
    result(){return {statusCode,headers,body:payload};}
  };
}
export async function handler(event) {
  const req=makeReq(event),res=makeRes();
  await apiHandler(req,res);
  return res.result();
}
