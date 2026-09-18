const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY || '';
const POSTHOG_HOST = (process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/$/, '');
const enabled = Boolean(POSTHOG_KEY);

const safeProperties = (properties = {}) => {
  const output = { ...properties };
  for (const key of ['email','phone','name','full_name','address','location_address','ip_address','user_agent','card','card_number','cvc','cvv','routing_number','account_number']) delete output[key];
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
    fetch(`${POSTHOG_HOST}/capture/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch (_) {}
}

export const captureServiceLifecycle = (event, payload = {}) => capture(event, {
  canonical_sku: payload.canonical_sku || payload.sku || undefined,
  service_id: payload.service_id || payload.serviceId || undefined,
  channel: payload.channel || payload.channelType || undefined,
  subchannel: payload.subchannel || payload.subchannelCode || undefined,
  pricing_model: payload.pricing_model || undefined,
  commercialization_status: payload.commercialization_status || undefined,
  gate_state: payload.gate_state || undefined,
  request_id: payload.request_id || payload.requestId || undefined,
  payment_state: payload.payment_state || undefined,
  capability_key: payload.capability_key || undefined,
  route: payload.route || undefined,
});

export const isAnalyticsEnabled = () => enabled;
