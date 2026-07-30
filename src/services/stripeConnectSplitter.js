// filename: src/services/stripeConnectSplitter.js
// DANI DECLARES LLC — STRIPE CONNECT SUBCONTRACTOR PAYOUT SPLITTER (SUBTRACTION RULE)

/**
 * Calculates 60% Subcontractor Crew Payout / 40% Dani Declares Net Platform Fee
 * Enforces Subtraction Rule to prevent floating-point penny rounding discrepancies
 */
export function calculateSubcontractorSplit(totalInvoiceAmount) {
  const totalCents = Math.round(Number(totalInvoiceAmount || 0) * 100);
  
  // 1. Calculate contractor payout directly in integer cents (60%)
  const crewPayoutCents = Math.round(totalCents * 0.60);
  
  // 2. Derive platform fee by subtraction rather than separate fraction multiplication
  const netPlatformFeeCents = totalCents - crewPayoutCents;

  return {
    totalInvoiceAmount: '$' + (totalCents / 100).toFixed(2),
    crewPayout: '$' + (crewPayoutCents / 100).toFixed(2),
    netPlatformFee: '$' + (netPlatformFeeCents / 100).toFixed(2),
    crewPayoutCents: crewPayoutCents,
    netPlatformFeeCents: netPlatformFeeCents
  };
}
