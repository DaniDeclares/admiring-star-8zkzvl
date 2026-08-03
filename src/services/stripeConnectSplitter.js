// filename: src/services/stripeConnectSplitter.js
// DANI DECLARES LLC — STRIPE CONNECT SUBCONTRACTOR PAYOUT SPLITTER (SUBTRACTION RULE)

export function calculateSubcontractorSplit(totalInvoiceAmount) {
  // Sanitize string input: strip currency symbols, commas, and whitespace
  const cleanAmount = String(totalInvoiceAmount || 0).replace(/[^0-9.]/g, '');
  const totalCents = Math.round((parseFloat(cleanAmount) || 0) * 100);

  // 1. Calculate contractor payout directly in integer cents (60%)
  const crewPayoutCents = Math.round(totalCents * 0.60);

  // 2. Derive platform fee by subtraction (Subtraction Rule)
  const netPlatformFeeCents = Math.max(0, totalCents - crewPayoutCents);

  return {
    totalInvoiceAmount: '$' + (totalCents / 100).toFixed(2),
    crewPayout: '$' + (crewPayoutCents / 100).toFixed(2),
    netPlatformFee: '$' + (netPlatformFeeCents / 100).toFixed(2),
    crewPayoutCents: crewPayoutCents,
    netPlatformFeeCents: netPlatformFeeCents
  };
}
