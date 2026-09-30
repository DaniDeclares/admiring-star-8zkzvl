import fs from "node:fs";
import { SEO_LANDING_PAGES } from "../src/data/seoLandingPagesData.js";

const sitemap = fs.readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const errors = [];

const urls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
for (const page of SEO_LANDING_PAGES) {
  const url = `https://danideclares.com/service-areas/${page.slug}`;
  if (!urls.has(url)) errors.push(`SEO landing page missing from sitemap: ${url}`);
  if (!page.title || page.title.length < 20) errors.push(`SEO title too short: ${page.slug}`);
  if (!page.description || page.description.length < 80) errors.push(`SEO description too short: ${page.slug}`);
}

if (!sitemap.includes("<urlset")) errors.push("Sitemap is missing a urlset root.");
if (!sitemap.includes("https://danideclares.com/")) errors.push("Sitemap does not contain the canonical origin.");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`SEO validation passed: ${SEO_LANDING_PAGES.length} governed landing pages and sitemap structure verified.`);
