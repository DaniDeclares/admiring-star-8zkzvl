export const CUSTOMER_SUCCESS_LINKS = Object.freeze({
  thumbtackReview: 'https://www.thumbtack.com/ga/stone-mountain/wedding-officiants/dani-declares/service/573953554115846159',
  googleBusiness: 'https://www.google.com/maps/search/?api=1&query=DANI%20DECLARES%20LLC',
  createAccount: '/portal/access?role=customer',
  requestService: '/request-service',
});

export function completedCustomerActions(job) {
  const status = String(job?.job_status || '').toLowerCase();
  if (!['completed', 'closed'].includes(status)) return [];
  return [
    { key: 'book_again', label: 'Request continued service', href: CUSTOMER_SUCCESS_LINKS.requestService },
    { key: 'thumbtack_review', label: 'Review us on Thumbtack', href: CUSTOMER_SUCCESS_LINKS.thumbtackReview, external: true },
    { key: 'google_review', label: 'Review us on Google', href: CUSTOMER_SUCCESS_LINKS.googleBusiness, external: true },
  ];
}
