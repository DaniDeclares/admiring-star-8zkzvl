// Test-only, fail-closed guard. No outbound network is permitted.
const http = require('node:http');
const https = require('node:https');
const net = require('node:net');
const dns = require('node:dns');
function denied() { throw new Error('OWNER_REVIEW_TEST_NETWORK_DENIED'); }
http.request = denied; http.get = denied;
https.request = denied; https.get = denied;
net.connect = denied; net.createConnection = denied; dns.lookup = denied;
globalThis.fetch = denied;
