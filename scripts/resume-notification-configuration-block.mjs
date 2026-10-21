// Explicit per-record recovery for configuration blocks and credential rejections.
// Run only after correcting and validating the worker configuration.
import { createRequire } from 'node:module';
import { resumeConfigurationBlocked } from '../lib/notificationOutbox.mjs';
import { renderTransactionalEmail } from '../api-handlers/daniTransactionalEmailTemplates.js';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');
const id = process.argv[2];
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '')) {
  throw new Error('Supply exactly one outbox UUID; bulk recovery is not supported');
}
if (process.argv.length !== 3 || !process.env.DATABASE_URL) throw new Error('Worker DATABASE_URL and one UUID are required');
const db = new PrismaClient();
try {
  await resumeConfigurationBlocked({ db, id, renderEmail:renderTransactionalEmail });
  console.log(JSON.stringify({ id, status:'PENDING', action:'recoverable configuration failure released; no provider called' }));
} finally { await db.$disconnect(); }
