# DANI DECLARES — Sales Contractor Training Guide (Draft)

Pairs with `DANI_SALES_CONTRACTOR_AGREEMENT_DRAFT.md` and
`DANI_CALL_DISPOSITIONS_DRAFT.md`. This is a call **framework**, not a
verbatim script — DANI's actual service catalog, pricing, and current
promotions live in the quote builder and service catalog docs
(`docs/dani-declares-master-service-catalog.md`), not here. Fill in the
bracketed sections from those sources before handing this to anyone; don't
let it go stale against the real catalog.

## 0. Compliance non-negotiables (cover this before anything else)

These are hard rules, not style preferences. A new contractor should be able
to repeat them back before their first live call:

1. **Never take a card number, CVV, or bank account/routing number by voice,
   text, or chat.** This is DANI policy across the board, because manual
   capture expands PCI scope — it holds even for sales where a checkout link
   isn't available yet. Where a Stripe checkout link *is* available (today,
   that's checkout-eligible Resident Concierge / CH01 sales — most other
   channels and any recurring quote-priced sale don't have one yet), send
   that link generated from the customer's estimate. If a link isn't
   available or the customer can't use it, escalate to DANI's ops/finance
   contact for the proper process — don't work around it by taking the
   number yourself. Separately, whatever the collection path, CVV must never
   be stored after a charge is authorized — that's the one PCI DSS actually
   forbids outright.
2. **Never manufacture urgency.** No "this price expires when we hang up," no
   fake "last spot," unless it is literally true and DANI has approved saying
   it.
3. **Never discourage someone from thinking it over, asking a partner, or
   requesting something in writing.** If they want to think about it, that's a
   disposition (see dispositions doc), not an objection to overcome by
   pressure.
4. **State cancellation/refund/guarantee terms exactly as published.** Don't
   improvise a better-sounding version.
5. **Disclose that calls may be recorded, where required, at the start of the
   call**, per DANI's current recording-consent policy for the caller's and
   customer's states.
6. **If a customer disputes a charge or says they didn't authorize it,** stop,
   don't argue them out of the dispute, and route it to DANI's ops contact the
   same day.

Breaking any of the above is a same-day escalation to DANI, not a coaching
note for later — several of these track legal requirements (FTC Telemarketing
Sales Rule, state mini-TSRs, and DANI's own PCI-scope-reduction policy), and
liability for violating the telemarketing rules specifically can land on the
individual caller, not just DANI.

## 1. Opening

Identify yourself and DANI DECLARES by name. State why you're calling in one
sentence — what the person requested or was referred for, honestly. Don't
imply an exclusive "selection" process if the lead came from an ad, referral,
or web form; say where it actually came from if asked.

`[Insert DANI's current opening line once approved.]`

## 2. Discovery — earn the right to quote

Ask about the actual need before presenting anything:

- What service or problem are they trying to solve?
- Timeline — is this urgent, or exploratory?
- Property/location details relevant to service eligibility (see the
  channel/subchannel rules in the catalog docs — pricing and eligibility
  differ by channel).
- Budget expectations, asked honestly rather than as a script gate.

The goal is matching them to a real SKU in the catalog, not steering everyone
to the same offer regardless of fit.

## 3. Presenting the quote

Generate the quote through DANI's quote builder / estimate flow rather than
quoting a number from memory — the estimate becomes the frozen price that
checkout validates against, so a verbally-promised price that doesn't match
what's in the system will fail at checkout and create a bad customer
experience. Walk through what's included and what isn't, plainly — model this
on the "what membership includes / does not include" clarity that's worth
copying from other programs' materials, adapted to DANI's actual service
scope.

## 4. Handling hesitation

If they want to think it over, ask a partner, or get something in writing:
let them. Offer to send the quote and a callback time. This is a disposition
(`CALLBACK-SCHEDULED` or `QUOTE-SENT-PENDING-DECISION`), not a wall to push
through. Genuine objection-handling (price, timing, scope questions) is fine
and expected; talking someone out of a legitimate pause is not.

## 5. Closing — sending payment

Once they're ready: confirm the service, price, and any recurring terms out
loud, confirm their email, and check whether this sale is checkout-eligible.
If it is, send the Stripe checkout link tied to their estimate, stay on the
line if useful while they complete it, then confirm receipt before ending the
call. If it isn't — a channel other than Resident Concierge, or a recurring
quote-priced service, which is blocked from online checkout pending owner
review — tell the customer honestly that finishing their order needs one more
step, and hand off to DANI's ops/finance contact for that. Never ask for the
card number yourself either way.

## 6. Wrap-up

Log a disposition (see `DANI_CALL_DISPOSITIONS_DRAFT.md`), any callback time,
and notes needed for the next person who touches this lead — written so a
stranger can pick it up, not shorthand only you'd understand.

## 7. What good coaching looks like

Coach on: accuracy against the catalog, whether discovery actually happened
before quoting, clarity of the offer, and whether compliance non-negotiables
were followed. Do not coach people toward higher pressure, faster "yes"
rates, or discouraging pauses — that's the exact pattern that creates legal
exposure and bad-faith refund/chargeback rates later.
