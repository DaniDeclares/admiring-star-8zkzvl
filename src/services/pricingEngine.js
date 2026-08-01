import { getMarketConfig } from '../config/markets';

const MEMBERSHIP_DISCOUNTS = {
  bronze: 0.04,
  silver: 0.08,
  gold: 0.12,
  executive: 0.15
};

const SERVICE_RELATIONSHIPS = {
  'PO-101': {
    prerequisites: ['PO-111'],
    recommendedAddOns: ['PO-115', 'ND-101'],
    followUpServices: ['PO-150'],
    recurringOpportunities: ['ret-multi-family-5']
  },
  'ND-101': {
    prerequisites: [],
    recommendedAddOns: ['BP-505', 'LG-801'],
    followUpServices: ['AS-201'],
    recurringOpportunities: []
  },
  'EV-401': {
    prerequisites: [],
    recommendedAddOns: ['BP-507', 'RS-903'],
    followUpServices: ['OC-1005'],
    recurringOpportunities: []
  }
};

function roundCurrency(value) {
  return Number(value.toFixed(2));
}

function calculateApproval(subtotal, discountPercent = 0) {
  const approvalRequired = subtotal >= 5000 || discountPercent >= 0.2;
  const approvalReason = [];

  if (subtotal >= 5000) {
    approvalReason.push('quote exceeds $5,000 threshold');
  }

  if (discountPercent >= 0.2) {
    approvalReason.push('discount exceeds 20%');
  }

  return {
    approvalRequired,
    approvalReason: approvalReason.join(' and ')
  };
}

export function calculatePropertyQuote(options = {}) {
  const { market = 'ATL', squareFeet = 0, unitCount = 1, laborHours = 0, mileage = 0, addOns = [] } = options;
  const config = getMarketConfig(market);
  const laborCost = (laborHours || squareFeet / 200) * config.laborRate;
  const mileageCost = Math.max(0, mileage - config.mileageIncluded) * config.mileageRate;
  const addOnCost = addOns.length * 65;
  const subtotal = roundCurrency(laborCost + mileageCost + addOnCost);
  const tax = roundCurrency(subtotal * config.taxRate);
  const total = roundCurrency(subtotal + tax);
  const approval = calculateApproval(total, options.discountPercent || 0);

  return {
    quoteType: 'property',
    market,
    subtotal,
    tax,
    total,
    ...approval,
    breakdown: {
      laborCost,
      mileageCost,
      addOnCost,
      marketConfig: config
    }
  };
}

export function calculateNotaryQuote(options = {}) {
  const { market = 'ATL', appointmentCount = 1, miles = 0, discountPercent = 0 } = options;
  const config = getMarketConfig(market);
  const travelFee = Math.max(0, miles - config.mileageIncluded) * config.mileageRate;
  const subtotal = roundCurrency(appointmentCount * 125 + travelFee);
  const tax = roundCurrency(subtotal * config.taxRate);
  const total = roundCurrency(subtotal + tax);
  const approval = calculateApproval(total, discountPercent);

  return {
    quoteType: 'notary',
    market,
    subtotal,
    tax,
    total,
    ...approval,
    breakdown: {
      baseFee: appointmentCount * 125,
      travelFee,
      marketConfig: config
    }
  };
}

export function calculatePrintQuote(options = {}) {
  const { market = 'ATL', pageCount = 1, colorPages = 0, discountPercent = 0 } = options;
  const config = getMarketConfig(market);
  const baseCost = pageCount * 0.2;
  const colorCost = colorPages * 0.35;
  const subtotal = roundCurrency(baseCost + colorCost);
  const tax = roundCurrency(subtotal * config.taxRate);
  const total = roundCurrency(subtotal + tax);
  const approval = calculateApproval(total, discountPercent);

  return {
    quoteType: 'print',
    market,
    subtotal,
    tax,
    total,
    ...approval,
    breakdown: {
      baseCost,
      colorCost,
      marketConfig: config
    }
  };
}

export function calculateEventQuote(options = {}) {
  const { market = 'ATL', guestCount = 1, hours = 0, discountPercent = 0 } = options;
  const config = getMarketConfig(market);
  const laborCost = (hours || guestCount / 25) * config.laborRate;
  const subtotal = roundCurrency(laborCost + guestCount * 4);
  const tax = roundCurrency(subtotal * config.taxRate);
  const total = roundCurrency(subtotal + tax);
  const approval = calculateApproval(total, discountPercent);

  return {
    quoteType: 'event',
    market,
    subtotal,
    tax,
    total,
    ...approval,
    breakdown: {
      laborCost,
      guestSupportCost: guestCount * 4,
      marketConfig: config
    }
  };
}

export function calculateInvestmentQuote(serviceCode, options = {}) {
  const normalizedCode = String(serviceCode || '').toUpperCase();
  const baseQuote = calculateQuote(normalizedCode, options);
  const baseInvestment = baseQuote.total;
  const beds = options.beds || 1;
  const baths = options.baths || 1;
  const squareFeet = options.squareFeet || 1000;
  const urgency = options.urgency || 'standard';
  const volume = options.volume || 'single';
  const membershipTier = String(options.membershipTier || 'bronze').toLowerCase();

  const bedAdjustment = beds > 2 ? 60 : 0;
  const bathAdjustment = baths > 2 ? 45 : 0;
  const sizeAdjustment = squareFeet > 1800 ? 75 : 0;
  const urgencyAdjustment = urgency === 'rush' ? 90 : urgency === 'same-day' ? 140 : 0;
  const volumeAdjustment = volume === 'monthly' ? -0.08 * baseInvestment : 0;
  const membershipDiscount = MEMBERSHIP_DISCOUNTS[membershipTier] || 0;
  const targetInvestment = roundCurrency(baseInvestment + bedAdjustment + bathAdjustment + sizeAdjustment + urgencyAdjustment + volumeAdjustment);
  const discountedInvestment = roundCurrency(targetInvestment * (1 - membershipDiscount));

  return {
    serviceCode: normalizedCode,
    investment: discountedInvestment,
    pricingTier: urgency === 'same-day' ? 'premium' : 'standard',
    membershipDiscount,
    baseInvestment,
    adjustments: {
      bedAdjustment,
      bathAdjustment,
      sizeAdjustment,
      urgencyAdjustment,
      volumeAdjustment
    },
    relationships: SERVICE_RELATIONSHIPS[normalizedCode] || {}
  };
}

export function calculateQuote(serviceCode, options = {}) {
  const normalizedCode = String(serviceCode || '').toUpperCase();

  if (normalizedCode.startsWith('PO-')) {
    return calculatePropertyQuote(options);
  }

  if (normalizedCode.startsWith('ND-')) {
    return calculateNotaryQuote(options);
  }

  if (normalizedCode.startsWith('BP-')) {
    return calculatePrintQuote(options);
  }

  if (normalizedCode.startsWith('EV-')) {
    return calculateEventQuote(options);
  }

  throw new Error(`Unsupported service code: ${serviceCode}`);
}

export { SERVICE_RELATIONSHIPS };
