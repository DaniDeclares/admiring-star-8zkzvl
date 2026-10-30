// Runs before transformed imports in the dedicated Jest environment.
const { TextDecoder } = require('node:util');
if (typeof globalThis.TextDecoder === 'undefined') globalThis.TextDecoder = TextDecoder;
