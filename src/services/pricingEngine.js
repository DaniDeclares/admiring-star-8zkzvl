import { getMarketConfig } from '../config/markets';

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
