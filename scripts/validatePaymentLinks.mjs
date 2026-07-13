import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { paymentLinks } from "../src/data/paymentLinks.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportPath = path.join(__dirname, "paymentLinkReport.json");
const needsRecreatedPath = path.join(__dirname, "..", "NEEDS_RECREATED.md");
const pricesPath = path.join(__dirname, "..", "prices.csv");

const errorIndicators = [
  "something-went-wrong",
  "page-not-found",
  "not-found",
  "error",
];

const parseCsv = (content) => {
  const [headerLine, ...rows] = content.trim().split(/\r?\n/);
  if (!headerLine) {
    return [];
  }
  const headers = headerLine.split(",").map((header) => header.trim());
  return rows.map((row) => {
    const values = row.split(",").map((value) => value.trim());
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] ?? "";
      return acc;
    }, {});
  });
};

const loadPrices = async () => {
  try {
    const content = await fs.readFile(pricesPath, "utf-8");
    return parseCsv(content);
  } catch (error) {
    return [];
  }
};

const checkLink = async (id, url) => {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "payment-link-validator",
      },
    });
    const finalUrl = response.url || url;
    const status = response.status;
    const hasErrorIndicator = errorIndicators.some((indicator) =>
      finalUrl.toLowerCase().includes(indicator)
    );
    const ok = response.ok && !hasErrorIndicator;
    return {
      id,
      url,
      status,
      finalUrl,
      ok,
    };
  } catch (error) {
    return {
      id,
      url,
      status: null,
      finalUrl: url,
      ok: false,
      error: error.message,
    };
  }
};

const run = async () => {
  const entries = Object.entries(paymentLinks).map(([id, url]) => ({ id, url }));
  const results = [];
  for (const entry of entries) {
    // eslint-disable-next-line no-await-in-loop
    const result = await checkLink(entry.id, entry.url);
    results.push(result);
  }

  const broken = results.filter((result) => !result.ok);
  const report = {
    generatedAt: new Date().toISOString(),
    total: results.length,
    brokenCount: broken.length,
    broken,
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  const prices = await loadPrices();
  const lines = ["# Stripe Payment Links Needing Recreation", ""]; 

  if (broken.length === 0) {
    lines.push("No broken payment links detected.");
  } else {
    lines.push("| Service | Desired Deposit Amount |", "| --- | --- |");
    broken.forEach((item) => {
      const priceMatch = prices.find((price) => price.id === item.id);
      const amount = priceMatch?.deposit_amount || "TBD";
      const name = priceMatch?.name || item.id;
      lines.push(`| ${name} | ${amount} |`);
    });
  }

  await fs.writeFile(needsRecreatedPath, lines.join("\n"));
};

run();
