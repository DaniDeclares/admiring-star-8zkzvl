// filename: src/services/travelCalculator.js
// INTERNAL ONLY - Travel mileage calculator with input sanitization

export function calculateTravelFee(destinationAddress, state = "GA", miles = 0) {
  const includedMiles = 20;
  const perMileRate = 1.00;

  // Sanitize miles input to prevent negative or non-numeric values
  const parsedMiles = Math.max(0, parseFloat(miles) || 0);
  const excessMiles = Math.max(0, parsedMiles - includedMiles);
  const travelFee = excessMiles * perMileRate;

  return {
    dispatchOriginRegion: state.toUpperCase() === "SC" ? "Regional SC Base" : "Metro Atlanta, GA Base",
    includedMiles,
    excessMiles,
    travelFee,
    formattedTravelFee: "$" + travelFee.toFixed(2)
  };
}
