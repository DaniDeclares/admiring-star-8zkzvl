# Digital product rebuild evidence (edition 2 drafts, 2026-10-11, revision 2)

Scope: the six weakest products from the quality assessment, rebuilt as fillable, printable PDFs on the canonical cream/burgundy/gold palette, each with a standard and an ink-saver variant. **Nothing is published or uploaded; no customer download was replaced; no price changed; Home Reset v3 stays unapproved.** Originals are intact (hashes in each product README). Previews: `products/digital/_quality-review/side-by-side/*.jpg` (original left, draft right, first 8 pages).

| Product | Original | Edition 2 draft (standard) | Ink-saver |
|---|---|---|---|
| DIY Marketing Starter Kit | `DANI_DIY_Marketing_Starter_Kit_COMPLETE_17pg.pdf` 8546dafa6748… | `DANI_DIY_Marketing_Starter_Kit_v2_printable.pdf` f1d096b2a19b… (21p, 255 fields) | `DANI_DIY_Marketing_Starter_Kit_v2_ink_saver.pdf` (21p) |
| No-Face Reels & Voiceover Kit | `DANI_No_Face_Reels_Voiceover_Kit_COMPLETE_24pg.pdf` 9e618a219301… | `DANI_No_Face_Reels_Voiceover_Kit_v2_printable.pdf` 5257018cdd02… (22p, 163 fields) | `DANI_No_Face_Reels_Voiceover_Kit_v2_ink_saver.pdf` (22p) |
| Home Command Center | `Home_Command_Center_Enhanced.pdf` 96c2995c0c1a… | `DANI_Home_Command_Center_v2_printable.pdf` 887156ae7065… (16p, 356 fields) | `DANI_Home_Command_Center_v2_ink_saver.pdf` (16p) |
| House Manager Operations Kit | `92b27542-DANI_House_Manager_Operations_Kit_COMPLETE_22pg.pdf` e526afff40d4… | `DANI_House_Manager_Operations_Kit_v2_printable.pdf` 2dc311b8ed6d… (22p, 381 fields) | `DANI_House_Manager_Operations_Kit_v2_ink_saver.pdf` (22p) |
| Property Inspection & Photo Log | `DANI_Property_Inspection_Photo_Log.pdf` 27d622d86caa… | `DANI_Property_Inspection_Photo_Log_v2_printable.pdf` b17f2e884c43… (8p, 130 fields) | `DANI_Property_Inspection_Photo_Log_v2_ink_saver.pdf` (8p) |
| Client Intake & Scope Change | `DANI_Client_Intake_Scope_Change.pdf` a39be66a421a… | `DANI_Client_Intake_Scope_Change_v2_printable.pdf` 8def718310e9… (9p, 104 fields) | `DANI_Client_Intake_Scope_Change_v2_ink_saver.pdf` (9p) |

## Content preserved
DIY Marketing: all 15 original captions are carried (7-page library, each with fillable numbered gaps). No Face Reels: all 20 scripts, 15 sequences, 5 templates, 30 hooks. House Manager and Home Command Center: every original page. Inspection and Intake: every original section plus forms. The pocket apps and CSV trackers in the originals stay as companions, unchanged.

## Checks run (what each does and does not prove)
- **Text scan** of every draft for "fictional", "placeholder", "lorem", bracketed fields, "TODO", "insert your/a": 0 hits. Examples are labelled "Example" or "illustration". One sentence frame ("I help ___ with ___ by ___") remains on purpose as a writing prompt.
- **Real viewers:** rendered page by page with poppler (pdftoppm) and with **pdfium** (Chrome's PDF engine) with form drawing on: every page of all six renders non-blank. Not tested: Adobe Acrobat, macOS Preview/Safari, iOS/Android viewers. Those remain open.
- **Fields:** each draft has real AcroForm fields; a fill-and-read-back test passed with pypdf for all six. Counts: DIY 255, Reels 163, Command Center 356, House Manager 381, Inspection 130, Intake 104. Form fields use the standard Helvetica supplied by the viewer; display fonts (Playfair, Carlito) are embedded.
- **Accessibility (partial):** document title shown in the title bar (`DisplayDocTitle`), document language en-US, a bookmark for every page, and a tooltip on every field (e.g. "Quote rate, row 3") so screen readers announce what a field is. **Not done:** a full PDF/UA tag tree (reading order, structure, alt text for decorative graphics). These are not accessible-certified.
- **Print usability:** US Letter, 0.67 in side margins, no content in the footer band. The standard variant uses cream pages and burgundy bands; measured average ink coverage over three sample pages is about 14% (standard) versus 5% (ink-saver) for the DIY kit. Not tested: an actual printer, duplexing, or scaling-to-fit settings.
- **Calculation accuracy:** these six PDFs contain no automatic calculations; where a kit mentions a rate (for example inquiry per post) it states the formula for the buyer to apply by hand. The calculators that do exist (Cleaning Job Kit workbook, Weekly Planner tracker, and the internal validation workbook) were verified by LibreOffice recalculation against hand-computed values (validation workbook example: margin 51.7% for a $149 job with 0.9 hours at $75 and a $4.50 fee, matching (149 - 72) / 149).
- **Buyer-workflow walk-through (by me, not by real buyers):** open the file, read one "start here" page, fill the first field, and finish a first worksheet within a few minutes. Each kit opens on a one-page orientation and a numbered sequence; the DIY and Reels kits end with a scorecard or learning loop; Inspection and Intake pair with their pocket apps. No claim of buyer outcomes is made.
- **Layout:** the generator raises on page overflow and over-long checklist items; contact sheets were reviewed for every product.
- **Privacy:** no kit asks for access codes, passwords or sensitive data; privacy and permission pages are included.

## Not done (needs the owner or a real device)
Acrobat/Preview/phone testing, a tagged-PDF accessibility pass, a physical print test, owner and ChatGPT approval of tone, claims and design, and Shopify upload with delivery verification (no Shopify access in this session). Comparison against established paid planners was by design review only, not a market test.

## Generators (reproducible)
`tools/product-art/build_diy_marketing.py`, `build_reels.py`, `build_home_command_center.py`, `build_house_manager.py`, `build_inspection_intake.py`, layout engine `kit_blocks.py`, toolkit `kit_lib.py`; provenance `tools/product-qa/product_provenance.json` and `write_product_readmes.py`.
