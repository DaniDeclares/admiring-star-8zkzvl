import * as Sentry from '@sentry/node';

let initialized = false;

function initialize() {
  if (initialized) return;
  initialized = true;
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}

export function captureServerException(error, { route, stage } = {}) {
  initialize();
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  Sentry.captureException(error, {
    tags: { surface: 'vercel-function', ...(route ? { route } : {}), ...(stage ? { stage } : {}) },
  });
}

export async function flushServerSentry() {
  if (initialized) await Sentry.flush(1500);
}
