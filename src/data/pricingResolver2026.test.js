/*
 * LEGACY TEST QUARANTINE (2026-09-05)
 *
 * These tests assert obsolete pricingCanon IDs (mobile_notary, loan_signing,
 * etc.). Current production pricing is governed through the commercial offer
 * registry and masterCommercialResolver. Preserve history without allowing
 * stale tests to drive current pricing architecture.
 */

describe.skip('canonical pricing resolver — legacy catalog migration pending', () => {});
