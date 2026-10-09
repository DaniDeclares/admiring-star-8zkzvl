// Operation $1 Million Dollar Company: existing content tracks, not new funnels.
// Keep recruiting, customer acquisition, urgent offers, and daily storytelling distinct.
// Publication is an explicit owner action; a listed offer is not proof of release readiness.
export const OCTOBER_CONTENT_TRACKS = Object.freeze({
  BUILD_WITH_DANI: Object.freeze({
    audience: 'providers_and_collaborators',
    purpose: 'Invite providers, makers and collaborators to express interest.',
    campaign: 'build-with-dani',
    destination: '/build-with-me',
    conversion: 'partner_interest',
    requiresProviderApproval: true,
    paidWorkGuaranteed: false,
  }),
  LET_DANI_BUILD_YOU: Object.freeze({
    audience: 'paying_business_customers',
    purpose: 'Help customers request business-building and execution support.',
    campaign: 'let-dani-build-you',
    destination: '/request-service?channelType=B2B&frontDoor=CH04-F02&audience=hire-dani',
    conversion: 'service_request_then_governed_quote',
  }),
  THREE_SERVICES_THREE_PRODUCTS: Object.freeze({
    audience: 'october_buyers',
    purpose: 'Generate collected revenue for current October obligations from six existing offers.',
    campaign: 'october-three-services-three-products',
    conversion: 'governed_service_request_or_verified_product_checkout',
    offers: Object.freeze({
      digital: Object.freeze([
        Object.freeze({ name: 'Cleaning Operator Job Kit', priceUsd: 19, release: 'BLOCKED_STOREFRONT_PASSWORD' }),
        Object.freeze({ name: 'Small Business Weekly Operations Planner', priceUsd: 15, release: 'BLOCKED_STOREFRONT_PASSWORD' }),
        Object.freeze({ name: '7-Day Home Reset Kit', priceUsd: 9, release: 'BLOCKED_STOREFRONT_PASSWORD' }),
      ]),
      // The historical three-service campaign has varied. Resolve the exact
      // service selection against current governed catalog before publishing.
      services: Object.freeze([]),
    }),
    publishable: false,
    blockers: Object.freeze(['Verify all three service selections and request paths', 'Verify logged-out Shopify downloads and checkout', 'Protect residential address']),
  }),
  DAILY_MILLION_DOLLAR_OPERATION: Object.freeze({
    audience: 'followers_and_community',
    purpose: 'Document actual daily learning, growth, setbacks and progress.',
    campaign: 'operation-million-dollar-daily',
    conversion: 'follow_and_engage',
    separateFromPromotionalPosts: true,
  }),
});

export function octoberCampaignLink(track, { source = 'facebook', medium = 'organic', content = '' } = {}) {
  const entry = OCTOBER_CONTENT_TRACKS[track];
  if (!entry || !entry.destination) return null;
  const [path, query = ''] = entry.destination.split('?');
  const params = new URLSearchParams(query);
  params.set('utm_source', source);
  params.set('utm_medium', medium);
  params.set('utm_campaign', entry.campaign);
  if (content) params.set('utm_content', content);
  return `${path}?${params.toString()}`;
}

export function octoberTrackCanPublish(track) {
  const entry = OCTOBER_CONTENT_TRACKS[track];
  if (!entry) return false;
  // The urgent six-offer post must be rechecked against live release state.
  return entry.publishable !== false;
}
