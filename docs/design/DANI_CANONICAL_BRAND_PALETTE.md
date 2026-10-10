# DANI DECLARES — Canonical Brand Palette

**Authority:** Owner-provided *Home Command Center* visual reference, approved October 10, 2026.
**Runtime source of truth:** `src/index.css` `:root` CSS custom properties. Do not establish independent brand palettes in individual views.

| Token | Approved color | Intended role |
| --- | --- | --- |
| `--dd-burgundy` | `#800020` | Identity, primary CTAs, important headings, active navigation |
| `--dd-burgundy-deep` | `#69001A` | Hover, darker state of the approved burgundy |
| `--dd-ivory` | `#F7F1E6` | Warm ivory page or section background |
| `--dd-cream` | `#FFFDF6` | Warm off-white paper and cards |
| `--dd-gold` | `#B38A2D` | Antique gold rules, decorative accents and eyebrow headings |
| `--dd-gold-soft` | `#E8D5B0` | Fine separators, borders and subtle gold details |

Existing aliases `--brand-burgundy-royal`, `--brand-gold-champagne`, `--brand-bg-ivory`, `--brand-card-cream` remain mapped to these global tokens for compatibility.

## Design direction
The screenshot's aesthetic is editorial, polished and warm: **burgundy + warm ivory + antique gold**, with crisp off-white paper surfaces, fine rules, and generous spacing. Do not replace this with a mostly charcoal or gray aesthetic. Do not make entire customer interfaces dark burgundy: use it intentionally alongside ivory and gold. Use the current typography and accessibility contrast rules.

## Mandatory instructions for website, customer, provider and product work
1. **Always read `src/index.css` before styling a feature.** This file owns authoritative palette values.
2. Reference colors as `var(--dd-burgundy)`, `var(--dd-ivory)`, `var(--dd-cream)`, `var(--dd-gold)`, `var(--dd-border-gold)`. Do not redeclare hexadecimal burgundy/gold/cream constants in individual components, JSX inline styles, product-cover generators or newly authored CSS. Tokens must be the *source* of the actual rendered values, not merely repeated values.
3. Neutral text, functional errors/success states and accessibility colors may use distinct semantic values; do not recolor alerts and statuses burgundy indiscriminately.
4. Existing hard-coded legacy styles should be **migrated incrementally when the owning file is legitimately touched**, after checking other open PRs, without a bulk rewrite that risks altering unrelated views or contrast.
5. Use the approved palette in original customer-facing printables, planners, product mockups, emails and marketing creatives where appropriate; distribution/fulfillment is still governed by existing release gates. Do not imply that a styled product has passed catalog, pricing or digital-delivery checks.
6. The preview remains the design acceptance authority; before Production verify desktop/mobile, contrast, focus states, print and actual owner acceptance.

## Migration checklist
- Canonical globals in `src/index.css`: updated by brand PR.
- CH01 Home Operations Starter: PR #632 must consume these tokens, not another page-defined palette.
- Provider Portal: PR #631 must consume these tokens, not another page-defined palette.
- Legacy hard-coded pages: untouched until individually audited for PR conflicts, accessibility and regression risk.
- Future design systems and AI/code-generation agents: reference this file and `src/index.css`, never a paraphrased recollection from chat.

**Scope:** This locks DANI DECLARES brand styling. It does not alter Shadow & Sol's independent identity, business channel definitions, commercial pricing, provider eligibility or Production deployment authority.


## Accessible component usage matrix (2026-10-10 audit)
These are reusable *semantic* combinations; do not create alternate brand hex values in features.

| UI element | Background | Foreground | Detail |
| --- | --- | --- | --- |
| Primary action | var(--dd-burgundy) | var(--dd-cream) | Strong focus outline |
| Secondary action | var(--dd-ivory) | var(--dd-burgundy) | var(--dd-gold) border |
| Headings | var(--dd-ivory) or var(--dd-cream) | var(--dd-burgundy) | Gold rule permitted |
| Card / planning worksheet | var(--dd-cream) | var(--dd-ink) | var(--dd-gold-soft) border |
| Dense provider data | var(--dd-cream) | var(--dd-ink) | Low-chroma separators; burgundy status headings |
| Supporting body text | var(--dd-cream) | var(--dd-ink) | Never gold as regular-sized text |
| Active navigation | var(--dd-burgundy) | var(--dd-cream) | Do not convey active state through color alone |

Measured WCAG normal-text contrast on the owner-approved palette:
- Burgundy #800020 / Paper white #FFFDF6 = 10.64:1 (passes 4.5:1).
- Burgundy #800020 / Warm ivory #F7F1E6 = 9.64:1 (passes 4.5:1).
- Antique gold #B38A2D / Paper white #FFFDF6 = 3.13:1 (**fails** normal text).
- Antique gold #B38A2D / Warm ivory #F7F1E6 = 2.83:1 (**fails** normal text).

**Do not use antique gold for small/light-weight text or communicate essential information using a gold-only indicator.** Using gold for focus alone can also fail non-text contrast against ivory; test the complete component rather than assuming the palette value is adequate. Decorative gold elements without informational meaning have different requirements.

## Brand integrity audit findings
- src/index.css is the authoritative palette; the build verifier also checks matching values in src/data/brandKit.js and legacy aliases in src/styles/tokens.css.
- A global token build pass does NOT prove every hard-coded legacy page complies. This is a **tracked partial migration**, not a declaration of system-wide visual completion.
- PR #633 should land after exact-head checks and review; coordinate PR #631 (provider) and #632 (CH01) against the merged global tokens. Do not merge the consumer/provider changes independently against old design authority without reconciling.
- Accessibility review must test actual buttons, tab states, form errors, print styles, keyboard focus, mobile responsive layout and insufficiently contrasting gold text.
