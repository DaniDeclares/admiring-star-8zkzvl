# Digital product rebuild evidence (edition 2 drafts, 2026-10-11)

Scope: the six weakest products from the quality assessment, rebuilt as fillable, printable PDFs on the canonical cream/burgundy/gold palette. **Nothing is published or uploaded; no customer download was replaced; no price changed.** Originals stay intact (hashes below). Previews: `products/digital/_quality-review/side-by-side/*.jpg` (original left, draft right, first 8 pages).

| Product | Original | Edition 2 draft |
|---|---|---|
| DIY Marketing Starter Kit | `DANI_DIY_Marketing_Starter_Kit_COMPLETE_17pg.pdf` 8546dafa6748… (17p) | `DANI_DIY_Marketing_Starter_Kit_v2_printable.pdf` bdaa8ba9dea4… (14p, 200 fields) |
| No-Face Reels & Voiceover Kit | `DANI_No_Face_Reels_Voiceover_Kit_COMPLETE_24pg.pdf` 9e618a219301… (24p) | `DANI_No_Face_Reels_Voiceover_Kit_v2_printable.pdf` 9656663de0e9… (22p, 163 fields) |
| Home Command Center | `Home_Command_Center_Enhanced.pdf` 96c2995c0c1a… (14p) | `DANI_Home_Command_Center_v2_printable.pdf` a2f94872b6c0… (16p, 356 fields) |
| House Manager Operations Kit | `DANI_House_Manager_Operations_Kit_COMPLETE_22pg.pdf` e526afff40d4… (22p) | `DANI_House_Manager_Operations_Kit_v2_printable.pdf` 1c9ae277f3ec… (22p, 381 fields) |
| Property Inspection & Photo Log | `DANI_Property_Inspection_Photo_Log.pdf` 27d622d86caa… (2p) | `DANI_Property_Inspection_Photo_Log_v2_printable.pdf` f38fbc490aa8… (8p, 130 fields) |
| Client Intake & Scope Change | `DANI_Client_Intake_Scope_Change.pdf` a39be66a421a… (2p) | `DANI_Client_Intake_Scope_Change_v2_printable.pdf` 314c445e845a… (9p, 104 fields) |

## Buyer-readiness checks run
- Text scan of each draft for "fictional", "placeholder", "lorem", bracketed fields, "TODO", "insert your": 0 hits in all six. Examples are labelled "Example" or "illustration".
- `tools/product-qa/audit_pdfs.py`: no sparse pages, no flagged terms.
- Form fields: every draft has real AcroForm fields; a fill-and-read-back test passed for all of them with pypdf. Display fonts (Playfair, Carlito) are embedded; form fields use the standard Helvetica supplied by the viewer.
- Layout: the generator raises on page overflow and on over-long checklist items; contact sheets were reviewed visually for every product.
- No access codes, passwords or sensitive data are requested anywhere; privacy and permission pages are included.

## Not done (needs the owner or a real device)
- No test in Acrobat, Preview, Chrome or a phone viewer; only pypdf and poppler rendering.
- No accessibility tagging (reading order/alt text) beyond a document title and author.
- DIY Marketing: the original's 15 local-service captions (pages 9-17) are condensed in the draft; see its README for the decision.
- Comparison against established paid planners was by design review only, not a market test. No claim of superiority is made.
- Owner/ChatGPT approval of tone, claims and design; Shopify upload and delivery verification (no Shopify access in this session).

## Generators (reproducible)
`tools/product-art/build_diy_marketing.py`, `build_reels.py`, `build_home_command_center.py`, `build_house_manager.py`, `build_inspection_intake.py`, layout engine `kit_blocks.py`, toolkit `kit_lib.py`.
