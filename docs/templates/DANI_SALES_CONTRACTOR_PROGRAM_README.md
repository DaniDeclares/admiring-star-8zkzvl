# Sales Contractor Hiring/Training Program — Overview

This set was built using the contractor paperwork and call materials from a
company Dani was engaged by (WWA) as a worked example of what a phone-sales
independent-contractor program contains structurally — not as a template to
copy text from. Nothing here reproduces WWA's document language; it's fresh
material informed by the shape of theirs, adapted to DANI DECLARES' actual
catalog/checkout stack.

**Files:**
- `DANI_SALES_CONTRACTOR_AGREEMENT_DRAFT.md` — the IC agreement
- `DANI_SALES_CONTRACTOR_KEY_TERMS_ACKNOWLEDGMENT_DRAFT.md` — plain-language
  front door signed before the full agreement
- `DANI_SALES_CONTRACTOR_TRAINING_GUIDE_DRAFT.md` — call framework
- `DANI_CALL_DISPOSITIONS_DRAFT.md` — disposition codes

All four are drafts needing attorney review before a real signature depends
on them, same as the existing `DANI_PROVIDER_AGREEMENT_DRAFT.md`.

**Revised after Dani's first review** (PR #231) to fix four issues: the
checkout-link instructions overstated what `api/create-checkout-session.js`
actually accepts today (CH01 only, recurring quote-priced sales blocked
pending owner review); the PCI-DSS language mischaracterized what the rule
itself prohibits (SAD/CVV retention after authorization) versus what's a DANI
policy choice (no manual capture at all); the Key Terms/agreement opened by
asserting contractor classification as settled rather than describing intent
subject to the whole relationship in fact; and there was no requirement to
snapshot which document/schedule version a signature actually attached to.
All four are corrected in the files below.

## What was worth keeping from WWA's structure

- A short plain-language **key terms acknowledgment**, initialed section by
  section, signed *before* the full legal agreement — good practice regardless
  of who uses it; most people never read the long-form version closely first.
- Training as its own paid/unpaid phase with clear rules, rather than folding
  it silently into the main compensation section.
- A **call disposition system** so every call has a logged, structured
  outcome instead of relying on memory or free-text notes.
- Clear "what's included / what's not" framing when presenting an offer.

## What was deliberately changed, not carried over

- **Payment collection.** WWA's script has reps read back full card numbers,
  CVVs, and billing zip codes on the call. Dani separately flagged that WWA's
  actual process has reps then relaying that data through a Teams chat. DANI
  DECLARES already has a hosted Stripe Checkout flow
  (`api/create-checkout-session.js`); the new materials route payment through
  that link wherever it's available instead of having anyone key in card
  data. That's currently narrower than "every payment," though — see the
  correction below and in the gaps section: the endpoint only serves
  checkout-eligible Resident Concierge (CH01) sales today, so the other
  channels need a real (still-unbuilt) governed alternative to manual card
  capture, not a document that pretends the link already covers them. The
  policy itself — manual card/CVV capture by voice or chat is never
  acceptable, and CVV is never retained after authorization — holds
  everywhere regardless of which payment path is live.
- **Manufactured urgency and fake "exception" discounts.** WWA's script
  pitches a set price ($199/$299) as a special "compliment" discount the rep
  is personally extending, and repeatedly states a discount "expires when we
  hang up." That's the kind of representation that creates exposure under the
  FTC Telemarketing Sales Rule and state consumer-protection law — and that
  exposure can land on the individual caller, not just the company. The new
  training guide states real prices as real prices and bans invented deadlines.
- **Discouraging a pause to think, or to ask a partner/lawyer.** WWA's script
  has specific rebuttals for "I want to speak with my husband/wife/lawyer" and
  a "point of no return" instruction not to let anyone call back later. The
  new guide treats a requested pause as a normal disposition, not an
  objection to defeat.
- **Contradiction between "independent contractor" and heavy behavioral
  control.** WWA's agreement states the company "reserves no control over the
  detail, manner or means" of the work, then mandates exact hours, a fixed
  script, company-approved remote-access software (AnyDesk) to inspect the
  contractor's computer, and specific hardware down to monitor count. That
  combination is a real misclassification risk, not just an internal
  inconsistency. The new agreement defaults to contractor-controlled method
  and schedule, and says explicitly that tightening it needs legal sign-off
  first.
- **One-sided training forfeiture.** WWA can end paid training early at its
  sole discretion and the contractor loses pay for days already worked, "for
  any reason." The new agreement pays for training time actually completed
  regardless of whether the engagement continues.
- **Reclassification indemnification.** WWA's agreement makes the contractor
  indemnify the company if the IC relationship is later reclassified as
  employment — shifting a risk the company created onto the individual. The
  new agreement drops this.

## Gaps found in WWA's set that DANI DECLARES should have and this doesn't yet fully solve either

- **No written data-handling/PCI policy anywhere in WWA's contractor
  paperwork.** The agreement addresses confidentiality of lead/customer
  information broadly but never mentions payment card data specifically or
  who's liable if it's mishandled. Section 6 of the new agreement bans manual
  card handling as policy, but the actual checkout link only covers
  checkout-eligible CH01 sales — every other channel, and any recurring
  quote-priced sale, currently has **no** governed payment path at all in the
  codebase. That fallback (an invoicing flow, or a PCI-compliant phone/IVR
  option if DANI ever wants one) still needs to be built; don't let the gap
  quietly get filled by someone taking a card number over the phone because
  the "proper" path doesn't exist yet for their sale.
- **No immutable record of what was actually signed.** The agreement's
  signature line binds the signer to its terms "as in effect on the date
  shown," and compensation lives in a separately-versioned schedule — but
  nothing here specifies how the portal should preserve *which* version of
  which document a given signature actually attached to. Before this goes
  live in the onboarding portal, store a snapshot at signing time: the
  agreement's version/hash, the compensation schedule's version, and the
  signed timestamp, together and immutably, the same way `dd_estimates`
  freezes a price so later catalog edits can't retroactively change what a
  customer agreed to. Otherwise a later edit to either document makes it
  ambiguous what a given contractor actually signed.
- **No recording-consent policy.** Neither WWA document says whether/where
  calls are recorded or how consent is handled across two-party-consent
  states. DANI needs an actual policy here (which states require dual
  consent, what the opening disclosure line is) before contractors start
  making calls — the training guide flags this as a to-do rather than
  inventing a policy that isn't DANI's to invent.
- **No real refund/dispute-handling procedure for contractors to follow** —
  WWA's script tells the customer about a 30-day guarantee but gives the
  *contractor* no instructions for what to do when a customer actually
  invokes it. The disposition list adds `DISPUTE-OR-COMPLAINT` as a code, but
  DANI needs the actual internal process behind it.
- **No lead-sourcing honesty standard.** WWA's script gives reps a vague,
  three-option non-answer for "how did you get my information," which is a
  soft dodge around actual list-sourcing disclosure obligations in some
  states. The new training guide requires answering honestly from the real
  source; DANI needs its lead-sourcing records to actually support that.

## Open questions for Dani

- Compensation structure (base/commission/per-close) isn't invented here —
  the agreement references "the compensation schedule DANI provides," left
  for Dani to define rather than guessed at.
- Whether this sales-contractor track and the existing dispatched-service
  Provider track ever overlap for the same person, and if the portal
  onboarding flow (`ContractorOnboardingPage.jsx`, being built in the other
  thread) should branch by contractor type.
- Recording-consent policy and phone-payment fallback procedure, noted above,
  need an actual decision before any of this goes live.
