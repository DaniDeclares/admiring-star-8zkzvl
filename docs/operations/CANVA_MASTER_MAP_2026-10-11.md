# Canva master map for DANI digital products (read-only, 2026-10-11)

Purpose: avoid competing versions. Canva holds the editable masters; the PDFs the owner supplied were exported from them, and the Edition 2 drafts in `products/digital/` are separate engineering rebuilds. **Nothing in Canva was edited, copied, exported or commented on.** The Shopify side was not readable from this session, so which file a customer actually receives is **not verified**.

Evidence the originals come from Canva: the Canva "House Manager Operations - Complete 22-Page Release Candidate" (design `DAHXlvucGUc`) reproduces the uploaded 22-page PDF text, including its "Fictional example: change trail" wording. The other "Complete" designs match the uploaded PDFs' page counts (14, 17, 22, 24); those were matched by title and page count, not read page by page.

| Product | Canva design | Title | Pages | Last updated (UTC) | Corresponds to | Edition 2 draft |
|---|---|---|---|---|---|---|
| 7-Day Home Reset | `DAHXlr4pLeE` | Complete 14-Page Release Candidate | 14 | 2026-10-11 18:23 | original 14pg COMPLETE PDF (customer file) | Home Reset v2/v3 draft (unapproved) |
| 7-Day Home Reset | `DAHXk2wlCn8` | Deep Zones Add-on (5 pages) | 5 | 2026-10-10 03:45 | 7Day Reset add-on | (not rebuilt) |
| 7-Day Home Reset | `DAHXlLFdy54` | Updated Six-page Add-on | 6 | 2026-10-10 04:10 | 7Day_Reset_Addon_Enhanced.pdf | (not rebuilt) |
| Home Command Center | `DAHXlGl9wcs` | Updated 14-page Master | 14 | 2026-10-10 04:10 | Home_Command_Center_Enhanced.pdf | Home Command Center v2 (16p) |
| Home Command Center | `DAHXk-GE6zE` | Editable Master (13 pages) | 13 | 2026-10-10 03:58 | earlier version | superseded by the 14-page master |
| House Manager | `DAHXlvucGUc` | Complete 22-Page Release Candidate | 22 | 2026-10-11 18:23 | DANI_House_Manager_Operations_Kit_COMPLETE_22pg.pdf (text confirmed identical) | House Manager v2 (22p) |
| House Manager | `DAHXlAAfm1c` | Fillable Edition | 11 | 2026-10-10 04:11 | House_Manager_..._Fillable_Edition.pdf | folded into v2 |
| House Manager | `DAHXkxNAlgo` | Editable Master (10 pages) | 10 | 2026-10-10 18:23 | earlier version | superseded |
| DIY Marketing Starter | `DAHXlTi_LzU` | Complete 17 Page Edition | 17 | 2026-10-11 18:23 | DANI_DIY_Marketing_Starter_Kit_COMPLETE_17pg.pdf | DIY Marketing v2 (21p) |
| DIY Marketing Starter | `DAHXlVqOK50` | 8 Page Master | 8 | 2026-10-10 05:09 | earlier version | superseded |
| DIY Marketing Starter | `DAHXlSbzY8Q` | DANI Brand Corrected (8 pages) | 8 | 2026-10-10 05:15 | earlier version | superseded |
| No-Face Reels | `DAHXlVeDw4Y` | Complete 24 Page Edition | 24 | 2026-10-11 18:23 | DANI_No_Face_Reels_Voiceover_Kit_COMPLETE_24pg.pdf | No-Face Reels v2 (22p) |
| No-Face Reels | `DAHXle1ZeWs` | 10 Page Master | 10 | 2026-10-10 05:09 | earlier version | superseded |
| No-Face Reels | `DAHXlWgUtAs` | DANI Brand Corrected (10 pages) | 10 | 2026-10-10 05:15 | earlier version | superseded |
| Cleaning Operator Job Kit | `DAHXk88K3pU` | Editable Master (14 pages) | 14 | 2026-10-11 18:23 | Cleaning_Operator_Job_Kit_Fillable_Edition.pdf (14p) | Cleaning Job Kit v2 (10p draft) |
| Cleaning Operator Job Kit | `DAHXlC-IyGg` | Fillable Edition | 14 | 2026-10-10 04:11 | same | same |
| Holiday Home Planner | `DAHXlBSGnfI` | Updated 15-page Master | 15 | 2026-10-10 04:11 | Holiday_Home_Planner_Enhanced.pdf | (kept as is) |
| Holiday Home Planner | `DAHXk_JBjog` | Editable Master (14 pages) | 14 | 2026-10-10 03:45 | earlier version | superseded |
| Home Manual Binder | `DAHXlPBOCHI` | 12-page Master | 12 | 2026-10-10 04:11 | DANI_Home_Manual_Binder.pdf | (not rebuilt) |
| Multifamily Turnover | `DAHXl48fG9s` | Premium Burgundy & Gold Phases 1-2 | 9 | 2026-10-10 07:34 | Multifamily Premium 8pg | (not rebuilt) |
| Multifamily Turnover | `DAHXlzAEsw4` | APPROVED Professional Burgundy #800020 Phases 1-2 | 8 | 2026-10-10 07:32 | Multifamily Premium 8pg | (not rebuilt) |
| Multifamily Make-Ready | `DAHXlowXt7g` | Phases 1 & 2 Burgundy & Gold | 8 | 2026-10-10 07:00 | Multifamily Phase1 PDF | (not rebuilt) |

## Handoff rules proposed
1. **One master per product.** Before changing any Shopify download, name the Canva design that is the master (the "Complete ... Release Candidate" for the four COMPLETE kits; the 14-page Updated Master for Home Command Center) and keep older masters (8-page, 10-page, 13-page, "Brand Corrected") out of delivery.
2. **My drafts are content and structure proposals, not replacements.** They add fillable fields, more worksheets, a 15-caption library, and removal of "fictional"/bracket wording. They were built in code, so they are not editable in Canva. Two safe ways to use them: (a) port the changed content into the Canva master and re-export, or (b) approve the code-built PDF as the delivered file and retire the Canva master for that product. Either choice is the owner's; do not do both.
3. **Compare before replacing.** For each product, export the Canva master to PDF, diff its text against the draft (side-by-side previews are in `products/digital/_quality-review/side-by-side/`), and confirm nothing in the master is lost.
4. **Naming:** Canva has three DIY masters and three Reels masters; the identity that Shopify serves must be confirmed before any upload.
5. **No Shopify action** (replace download, publish, price) from this work. Existing listing prices and identities stay as they are.
