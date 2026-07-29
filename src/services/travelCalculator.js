// filename: src/services/travelCalculator.js
// INTERNAL ONLY - Confidential dispatch origins for travel mileage calculations
// DO NOT EXPOSE EXACT ADDRESSES ON PUBLIC UI - PUBLIC DISPLAY IS TUCKER, GA & PIEDMONT, SC

const GA_DISPATCH_ORIGIN = "650 Abberley Way, Stone Mountain, GA 30083";
const SC_DISPATCH_ORIGIN = "110 Dill Rd, Piedmont, SC 29673";

/**
 * Calculates travel mileage and fee based on service region and destination.
 * Standard Policy: First 20 miles included in base visit fee (0).
 * Excess mileage billed at .00/mile round-trip.
 */
export function calculateTravelFee(destinationAddress, state = "GA", miles = 0) {
  const origin = state.toUpperCase() === "SC" ? SC_DISPATCH_ORIGIN : GA_DISPATCH_ORIGIN;
  const includedMiles = 20;
  const perMileRate = 1.00;

  let excessMiles = Math.max(0, miles - includedMiles);
  let travelFee = excessMiles * perMileRate;

  return {
    dispatchOriginRegion: state.toUpperCase() === "SC" ? "Piedmont, SC Region" : "Metro Atlanta / Stone Mountain, GA Region",
    includedMiles,
    excessMiles,
    travelFee,
    formattedTravelFee: "$" + travelFee.toFixed(2)
  };
}
