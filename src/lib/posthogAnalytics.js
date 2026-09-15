const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY || '';
const POSTHOG_HOST = (process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/$/, '');

const enabled = Boolean(POSTHOG_KEY);

const safeProperties = (properties = {}) => {
  const output = { ...properties };
  delete output.email;
  delete output.phone;
  delete output.name;
  delete output.full_name;
  delete output.address;
  delete output.location_address;
  return output;
};

export function capture(event, properties = {}) {
  if (!enabled || !event || typeof window === 'undefined') return;
  const body = JSON.stringify({
    api_key: POSTHOG_KEY,
    event,
    properties: {
      ...safeProperties(properties),
      $current_url: window.location.href,
      $pathname: window.location.pathname,
      $referrer: document.referrer || undefined,
    },
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${POSTHOG_HOST}/capture/`, new Blob([body], { type: 'application/json' }));
      return;
    }
    fetch(`${POSTHOG_HOST}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch (_) {
    // Analytics must never interrupt customer workflows.
  }
}

export const isAnalyticsEnabled = () => enabled;
