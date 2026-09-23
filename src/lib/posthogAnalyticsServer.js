const POSTHOG_KEY = process.env.POSTHOG_API_KEY || process.env.REACT_APP_POSTHOG_KEY || '';
const POSTHOG_HOST = (process.env.POSTHOG_HOST || process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/$/, '');

const safeProperties = (properties = {}) => {
  const output = { ...properties };
  for (const key of ['email','phone','name','full_name','address','location_address','ip_address','user_agent','card','card_number','cvc','cvv','routing_number','account_number']) delete output[key];
  return output;
};

export async function captureServer(event, properties = {}) {
  if (!POSTHOG_KEY || !event) return;
  try {
    await fetch(POSTHOG_HOST + '/capture/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: POSTHOG_KEY, event, properties: safeProperties(properties) }),
    });
  } catch (error) {
    console.error('PostHog server capture failed:', error?.message || error);
  }
}
