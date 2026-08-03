// filename: api/travel-quote.js
// Vercel Serverless Function - Internal Travel Mileage Calculator
// Confidential Origins: Stone Mountain, GA & Piedmont, SC

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { state = 'GA', miles = 0 } = req.body || {};
  const includedMiles = 20;
  const perMileRate = 1.00; // Round-trip excess mileage rate

  let excessMiles = Math.max(0, miles - includedMiles);
  let travelFee = excessMiles * perMileRate;

  return res.status(200).json({
    success: true,
    region: state.toUpperCase() === 'SC' ? 'Regional SC Base' : 'Metro Atlanta, GA Base',
    includedMiles,
    excessMiles,
    travelFee,
    formattedTravelFee: '$' + travelFee.toFixed(2)
  });
}
