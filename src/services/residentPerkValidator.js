// filename: src/services/residentPerkValidator.js
// DANI DECLARES LLC — B2B RESIDENT PERK VALIDATION ENGINE

export const ACTIVE_PARTNER_COMMUNITIES = {
  'ALL3-REALTY': { name: 'All3 Realty Communities', cleanDiscountPercent: 15, notaryDiscountDollars: 10 },
  'TUCKER-OAKS': { name: 'Tucker Oaks Apartment Homes', cleanDiscountPercent: 15, notaryDiscountDollars: 10 },
  'PIEDMONT-LOFTS': { name: 'Piedmont SC Residential Lofts', cleanDiscountPercent: 15, notaryDiscountDollars: 10 },
  'COMMUNITY-VIP': { name: 'Dani Declares Preferred Resident', cleanDiscountPercent: 15, notaryDiscountDollars: 10 }
};

export function validateResidentPerkCode(code) {
  const cleanCode = String(code || '').toUpperCase().trim();
  const partner = ACTIVE_PARTNER_COMMUNITIES[cleanCode];

  if (!partner) {
    return { valid: false, message: 'Invalid or expired resident perk code.' };
  }

  return {
    valid: true,
    code: cleanCode,
    communityName: partner.name,
    cleanDiscountPercent: partner.cleanDiscountPercent,
    notaryDiscountDollars: partner.notaryDiscountDollars,
    message: 'Verified! ' + partner.name + ' resident perks applied.'
  };
}
