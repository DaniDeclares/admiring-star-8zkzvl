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
