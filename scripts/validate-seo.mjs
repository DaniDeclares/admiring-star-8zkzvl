import fs from "node:fs";

const sitemap = fs.readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const registry = fs.readFileSync(new URL("../src/data/seoLandingPagesData.js", import.meta.url), "utf8");
const generated = fs.existsSync(new URL("../build", import.meta.url));
const errors = [];

const slugs = [...registry.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const urls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));

if (generated) {
  for (const slug of slugs) {
    const expected = new URL(`../build/service-areas/${slug}/index.html`, import.meta.url);
    if (!fs.existsSync(expected)) errors.push(`Generated SEO route missing: /service-areas/${slug}/`);
  }
}

for (const slug of slugs) {
  const url = `https://danideclares.com/service-areas/${slug}`;
  if (!urls.has(url)) errors.push(`SEO landing page missing from sitemap: ${url}`);
}

if (new Set(slugs).size !== slugs.length) errors.push("Duplicate SEO landing-page slug detected.");
if (!sitemap.includes("<urlset")) errors.push("Sitemap is missing a urlset root.");
if (!sitemap.includes("https://danideclares.com/")) errors.push("Sitemap does not contain the canonical origin.");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`SEO validation passed: ${slugs.length} governed landing pages and sitemap structure verified.`);
