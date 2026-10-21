// Display only wording supplied by the governed catalog. A numeric starting_price
// is not proof of an approved public price, nor a channel-resolved checkout amount.
export function publicCatalogPriceLabel(service, hidePrice = false) {
  if (hidePrice) return 'Solicitation / quote';
  const display = service?.publicPriceDisplay;
  return typeof display === 'string' && display.trim() ? display.trim() : 'Quote required';
}
