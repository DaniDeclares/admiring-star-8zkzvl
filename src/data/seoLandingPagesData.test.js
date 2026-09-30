import { SEO_LANDING_PAGES } from "./seoLandingPagesData.js";

describe("SEO landing page registry", () => {
  test("contains unique, crawlable slugs", () => {
    const slugs = SEO_LANDING_PAGES.map((page) => page.slug);
    expect(slugs.length).toBe(new Set(slugs).size);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  test("has people-first metadata for every landing page", () => {
    for (const page of SEO_LANDING_PAGES) {
      expect(page.title.length).toBeGreaterThan(20);
      expect(page.description.length).toBeGreaterThan(80);
      expect(page.targetCity).toBeTruthy();
      expect(page.serviceName).toBeTruthy();
      expect(page.faqs.length).toBeGreaterThan(0);
      for (const faq of page.faqs) {
        expect(faq.q).toBeTruthy();
        expect(faq.a).toBeTruthy();
      }
    }
  });
});
