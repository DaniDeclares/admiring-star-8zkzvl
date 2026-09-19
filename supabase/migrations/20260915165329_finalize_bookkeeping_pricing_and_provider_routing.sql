
UPDATE dd_master_service_universe SET
  customer_price = '$250–350 flat',
  provider_payout = '~65% of customer price to provider (~$163–228)',
  internal_cost = 'DANI margin ~35% of customer price (booking, admin, customer acquisition, liability)',
  fulfillment_lane = 'DANI → Provider (initial: Cass Rosser, provider-routed; open to additional qualified bookkeeping providers) → Completion'
WHERE canonical_sku = 'DNI-04A-021';

UPDATE dd_master_service_universe SET
  customer_price = '$350–700/mo',
  provider_payout = '~65% of customer price to provider (~$228–455/mo)',
  internal_cost = 'DANI margin ~35% of customer price (booking, admin, customer acquisition, liability)',
  fulfillment_lane = 'DANI → Provider (initial: Cass Rosser, provider-routed; open to additional qualified bookkeeping providers) → Completion'
WHERE canonical_sku = 'DNI-04A-022';

UPDATE dd_master_service_universe SET
  customer_price = '$200–400/mo',
  provider_payout = '~65% of customer price to provider (~$130–260/mo)',
  internal_cost = 'DANI margin ~35% of customer price (booking, admin, customer acquisition, liability)',
  fulfillment_lane = 'DANI → Provider (initial: Cass Rosser, provider-routed; open to additional qualified bookkeeping providers) → Completion'
WHERE canonical_sku = 'DNI-04A-023';

UPDATE dd_master_service_universe SET
  customer_price = '$250–500/engagement',
  provider_payout = '~65% of customer price to provider (~$163–325)',
  internal_cost = 'DANI margin ~35% of customer price (booking, admin, customer acquisition, liability)',
  fulfillment_lane = 'DANI → Provider (initial: Cass Rosser, provider-routed; open to additional qualified bookkeeping providers) → Completion'
WHERE canonical_sku = 'DNI-04A-024';

UPDATE dd_master_service_universe SET
  customer_price = '$300–650/packet — scope: funder-ready financial statement preparation only (not grant-writing or funding strategy)',
  provider_payout = '~60% of customer price to provider (~$180–390)',
  internal_cost = 'DANI margin ~40% of customer price (booking, admin, customer acquisition, liability, higher due to specialized/infrequent deliverable)',
  fulfillment_lane = 'DANI → Provider (initial: Cass Rosser, provider-routed; scope explicitly excludes grant writing/submission per provider agreement Exhibit A) → Completion'
WHERE canonical_sku = 'DNI-04A-025';

UPDATE dd_master_service_universe SET
  customer_price = '$30–45/hr or $350/mo retainer',
  provider_payout = '~65% of customer price to provider',
  internal_cost = 'DANI margin ~35% of customer price (booking, admin, customer acquisition, liability)',
  fulfillment_lane = 'DANI → Provider (initial: Cass Rosser, provider-routed; open to additional qualified bookkeeping providers) → Completion'
WHERE canonical_sku = 'DNI-04A-026';
