# DANI DECLARES LLC — Brand Kit v1.0

## Decision authority
- **OWNER-APPROVED primary burgundy:** `#800020` (Option C). Supersedes `#5B0E2D`, `#6B1F2B`, `#8C2942` as company-wide primary burgundy.
- **Working accent gold:** `#C9A45C` (pending owner approval; other historical golds: `#D4AF37`, `#C5A253`).
- **Accessible text gold:** `#8A6A1F` for gold-colored lettering on light backgrounds (pending owner approval). This is also the gold used in current store-image lettering.
- **Working ivory:** `#FFF9EF` (pending owner approval).
- **Working cream:** `#F2E7D5` (pending owner approval).
- Avoid dark-wine/charcoal-heavy branding. Navy in current digital-kit PDFs/previews is a release-specific exception, not a company brand color.

## Identity and logo
- Legal/brand name: **DANI DECLARES LLC**.
- Tagline: **We handle the execution.**
- **Preserve existing production logo:** `dani-declares-logo.svg` referenced by `public/index.html`. The asset was not found at `public/dani-declares-logo.svg` in the inspected repository; retrieve original deployed SVG and checksum before any logo work. Never generate a replacement or recolor the master without approval.

## Color accessibility rules
- Burgundy `#800020` on ivory/cream and white on burgundy: approved text combinations.
- Accent gold `#C9A45C` on ivory or cream: **do not use for normal text**; use for decorative lines, borders and accents only.
- Use darker text gold `#8A6A1F` for gold lettering on light backgrounds, and verify contrast against the exact deployed background. Aim for WCAG AA 4.5:1 minimum for normal text, 3:1 for large text.
- Accent gold `#C9A45C` on burgundy may be used for normal text only where its verified contrast is at least 4.5:1.

## Downstream rollout
- Current website theme uses historical burgundy `#6B1F2B`; replace with approved `#800020` after brand-kit approval and UI review, not as an unreviewed broad find-and-replace.
- Existing Shopify store images already use `#800020` and need no recoloring for this release.
- Keep existing navy kit PDFs until the coordinated post-launch recolor of both PDFs and previews.

## Typography (working standard, not verified website typography)
- Headings: Georgia Bold; body and UI: Arial with system sans-serif fallback.
- Audit existing website font usage before any implementation. Maintain legibility and contrast.

## Contacts
- **ONLY public business phone:** **(470) 485-7173**.
- **Legacy number to replace:** (470) 682-9348 (check GBP, Thumbtack profile without paid leads, Yelp, Apple Maps, Facebook, Instagram, directories).
- Website: https://danideclares.com
- General public email: **admin@danideclares.com — proposed, delivery unverified; do not publish as verified until tested**.
- Vendor/provider operations: **vendors@danideclares.com**.
- Existing outbound sales sender: **danideclaresns@gmail.com**; not the public-facing default.

## Governance
Approved: #800020, company name, tagline, phone, preserve current logo. Pending owner confirmation: exact gold/ivory/cream shades, font adoption, public email deliverability, original logo file retrieval. This record documents decisions; it is not proof of live website, Shopify, or directory updates. Keep one version-controlled authority and track downstream adoption separately.
