const sanitize = (value) => {
  if (value == null) return undefined;
  return String(value).slice(0, 160);
};

export function captureSentryEvent(name, data = {}) {
  if (typeof window === 'undefined' || !window.Sentry) return;
  const safeData = Object.fromEntries(
    Object.entries(data)
      .filter(([key, value]) => value !== undefined && value !== null && !/password|token|secret|authorization|email|phone/i.test(key))
      .map(([key, value]) => [key, typeof value === 'string' ? sanitize(value) : value])
  );
  if (typeof window.Sentry.addBreadcrumb === 'function') {
    window.Sentry.addBreadcrumb({
      category: 'dani.signup',
      message: name,
      level: 'info',
      data: safeData,
    });
  }
  if (typeof window.Sentry.captureMessage === 'function') {
    window.Sentry.captureMessage(`signup.${name}`, {
      level: 'info',
      tags: { flow: 'signup', stage: name },
      extra: safeData,
    });
  }
}

export function captureSentryException(error, context = {}) {
  if (typeof window === 'undefined' || !window.Sentry?.captureException) return;
  const safeContext = Object.fromEntries(
    Object.entries(context).filter(([key, value]) => value !== undefined && value !== null && !/password|token|secret|authorization|email|phone/i.test(key))
  );
  window.Sentry.captureException(error, {
    tags: { flow: 'signup', ...(safeContext.stage ? { stage: String(safeContext.stage) } : {}) },
    extra: safeContext,
  });
}
