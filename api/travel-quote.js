import fetch from "node-fetch";

const cache = new Map();
const rateLimit = new Map();

const CACHE_TTL_MS = 1000 * 60 * 60;
const RATE_LIMIT_WINDOW_MS = 1000 * 60 * 15;
const RATE_LIMIT_MAX = 30;

const roundTo = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
};

const checkRateLimit = (ip) => {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }
  entry.count += 1;
  return false;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const ip = getClientIp(req);
  if (checkRateLimit(ip)) {
    res.status(429).json({ error: "Too many requests. Please try again shortly." });
    return;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const originAddress = process.env.ORIGIN_ADDRESS;
  const baseRadius = Number.parseFloat(process.env.BASE_RADIUS_MILES || "10");
  const mileageRate = Number.parseFloat(process.env.MILEAGE_RATE || "1.0");
  const baseTravelFee = Number.parseFloat(process.env.BASE_TRAVEL_FEE || "25");

  if (!apiKey || !originAddress) {
    res.status(500).json({ error: "Server is missing travel quote configuration." });
    return;
  }

  let destinationAddress = "";
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    destinationAddress = body?.destinationAddress?.trim();
  } catch (error) {
    res.status(400).json({ error: "Invalid request payload." });
    return;
  }

  if (!destinationAddress) {
    res.status(400).json({ error: "Destination address is required." });
    return;
  }

  const cacheKey = destinationAddress.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.status(200).json(cached.data);
    return;
  }

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", originAddress);
  url.searchParams.set("destinations", destinationAddress);
  url.searchParams.set("units", "imperial");
  url.searchParams.set("key", apiKey);

  let data;
  try {
    const response = await fetch(url.toString());
    data = await response.json();
  } catch (error) {
    res.status(502).json({ error: "Unable to reach Google Maps API." });
    return;
  }

  if (data.status !== "OK") {
    res.status(400).json({ error: "Unable to calculate distance for that address." });
    return;
  }

  const element = data.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK") {
    res.status(400).json({ error: "Invalid destination address. Please try again." });
    return;
  }

  const meters = element.distance?.value;
  if (!meters && meters !== 0) {
    res.status(400).json({ error: "Distance data unavailable. Please retry." });
    return;
  }

  const miles = meters / 1609.34;
  const oneWayMiles = roundTo(miles, 1);
  const roundTripMiles = roundTo(oneWayMiles * 2, 1);
  const billableMilesRaw = Math.max(0, roundTripMiles - baseRadius * 2);
  const billableMiles = roundTo(billableMilesRaw, 1);
  const travelFee = roundTo(baseTravelFee + billableMiles * mileageRate, 2);

  const result = {
    oneWayMiles,
    roundTripMiles,
    billableMiles,
    travelFee,
  };

  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  res.status(200).json(result);
}
