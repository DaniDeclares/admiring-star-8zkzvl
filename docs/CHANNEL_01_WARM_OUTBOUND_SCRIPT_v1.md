# DANI DECLARES — Channel 01 (Resident) Warm Outbound Script v1

**Date:** 2026-09-17
**Channel:** CH01 — Resident Concierge (individual residential customers, including residents
handling their own small rental/unit)
**Status:** Draft, built directly from the live governed catalog (`dd_governed_service_offers` /
`services`) — not a parallel definition. Regenerate from the same query if the catalog changes.

## 0. Reality check before this goes into use

As of this writing, `service_requests` has 6 total rows. One is an explicit QA test record
("CONTROLLED Contract #1 fulfillment state-machine test," cancelled). Four more are Danielle's
own testing artifacts (`full_name: "q"`, her own contact info, garbage `request_details` like
"try"/"uyguy"). **Exactly one row looks like a real prospect**: a household-support inquiry for an
Atlanta apartment, submitted 2026-08-29, no linked SKU or quote amount attached.

That means: there is no warm-outbound *list* to run a calling operation against yet. This script
exists so it's ready the moment real lead volume shows up (site traffic, catalog/quote-builder
fixes shipped today, future marketing) — not because there's a backlog to work through today.
The one real lead should be called directly and personally; it doesn't need this script's
qualification step (there's nothing to re-qualify yet since it was never qualified the first
time).

## 1. Goal

Reactivate someone who previously expressed interest in a DANI service, confirm the need still
exists, and move them to the correct existing booking/quote/payment path. Nothing here creates a
new price, a new promise, or a new payment mechanism — it routes people into what already exists.

## 2. Guardrails — the rep never:

- Invents a price. Every price quoted must come from the live catalog (`starting_price` /
  `public_price_display`) or the portal's Quote Builder — never memory, never estimation.
- Promises availability/scheduling before checking.
- Overrides a quote or "rounds" a price to close.
- Takes card information over the phone. Every payment is a Stripe payment link or the site's
  checkout — sent by text/email, never read/typed by the rep.
- Sells a service that isn't `SELL_NOW` / `READY` / has zero authorized providers. If the catalog
  says "Quote required" or the service isn't checkout-eligible, the rep books a callback with
  Danielle, not a sale.
- Treats an incomplete or long-abandoned request as a confirmed quote. Anything without a locked
  price snapshot gets re-qualified from scratch, not assumed.

## 3. The rep should:

1. Identify the prior request (service, date, what was asked for).
2. Confirm the customer still has the need.
3. Re-qualify scope if the original request is vague or old.
4. Verify the current, live price for the applicable service.
5. Explain the solution in plain terms.
6. Handle objections honestly (see per-family objections below).
7. Send the correct Stripe payment link or booking path when the customer is ready.
8. Record the disposition (see taxonomy, §6).
9. Create/route a follow-up when the customer isn't ready yet.

## 4. Universal call framework

**OPEN → RECONNECT → DISCOVER → CONFIRM → SOLVE → INVESTMENT → CLOSE → DISPOSITION**

This is deliberately adapted from the WWA call structure's useful shape (a clear pain →
impact → solution → deliverables → investment progression), but built around a real, honestly
priced service instead of a manufactured-urgency membership, and with no same-call pressure
tactics (no "point of no return," no discouraging a callback, no reading card numbers).

**OPEN**
> "Hi [Name], this is [Rep] with DANI DECLARES — you'd reached out about [service/need] a
> little while back. Is now an OK time for two minutes?"

**RECONNECT**
> "I wanted to follow up because we never actually got you booked in. Before anything else —
> is this still something you need, or has that gotten handled another way?"

If handled elsewhere or no longer needed → disposition `Reached — no longer needs service`, end
call politely.

**DISCOVER** (only if scope is missing/unclear — skip if the original request was specific)
> Ask what's actually needed: property type, size/scope, timing, any access constraints. This is
> the re-qualification step — do not assume the original vague request is still accurate.

**CONFIRM**
> Repeat back what was heard in one sentence. Look up the matching live SKU. If nothing matches
> cleanly, this becomes a `Reached — quote needed` disposition, not a guess.

**SOLVE** (per-service-family talking points below)

**INVESTMENT**
> State the live starting price plainly, exactly as shown in the catalog (e.g. "starting at
> $140" for a starting-at price, or the flat price for a fixed one). Never round, never invent.
> For hourly/variable-quote services, say so directly: "that one's billed by the hour / scoped
> individually — I can get you an exact number through our quote tool before anything is
> charged."

**CLOSE**
> If ready and the service is checkout-eligible: "I'll text/email you a secure payment link
> right now — nothing is charged until you complete it yourself." Send the real Stripe link for
> that SKU. If not checkout-eligible or scope is unclear: route to the portal Request
> Service / Quote Builder flow instead of promising a number.

**DISPOSITION**
> Log the outcome immediately (see §6) and set the next action.

## 5. Service-family talking points

Pulled directly from the live CH01 `SELL_NOW` / `READY` catalog (61 SKUs, verified
2026-09-17). Prices shown are current `starting_price` values — always re-check against the
catalog before quoting, since prices can change.

### A. Standard & Deep Home Cleaning
*Resident Refresh (Standard Clean) $140 · Deep Structural Reset (Deep Clean) $275 · Deposit
Security Move-Out Turn $375 · plus a-la-carte details: Bathroom $65+, Kitchen $125+,
Bedroom/Closet/Living $125+, Floors $65+, Windows/Glass/Mirror (scoped), Laundry Area $110+,
Shower/Tub/Tile $150+, Upholstery $125, Mattress $75, Dust/Cobweb/High-Reach $95+, Odor
Neutralization $99+, Bin Sanitation $59+, Trash/Debris Support $65, Kitchen Appliance
Interior/Degrease $25+*

- **Pain:** the home hasn't been properly cleaned in a while, or a specific area (kitchen,
  bathrooms, move-out condition) needs to be right by a deadline.
- **Impact:** lost time doing it themselves, or a deposit/inspection risk if it's a move-out.
- **Solution:** match the scope to the right SKU — a full Standard or Deep clean for whole-home,
  or a single a-la-carte detail (kitchen, bathroom, floors, etc.) if that's all that's needed.
- **Deliverables:** state exactly what's included per the catalog description for that SKU —
  don't improvise scope.
- **Investment:** quote the exact starting price for the matched SKU.
- **Objections:**
  - *Price* — "the a-la-carte option lets you cover just [specific area] instead of a full
    clean if budget's the concern."
  - *Timing* — "let's check what's actually available before we lock anything — I don't want to
    promise a date I can't confirm." (Route to scheduling check, never invent availability.)

### B. Household Concierge & Personal Assistance
*Valet Wash/Dry/Fold $45 · Linen & Bedding Reset $50 · Closet & Wardrobe Optimization $225
(hourly) · Pantry & Kitchen Cabinet Organization $150 · Estate Liquidation & Decluttering $65/hr ·
Household Concierge/Personal Assistance $60/hr · Home Watch $65+ · Guest/Vacation Prep $125 ·
Errand Running $45/hr · Grocery Shopping $45 · Guest Room Setup $85 · Arrival/Departure
Concierge $75 · Gift Wrapping $45 · Home Inventory Documentation $55/hr · Package & Delivery
Management $35 · Kitchen Dishware/Cabinet Reset $95 · Post-Event Household Reset $55/hr ·
Fridge/Freezer Reset $85 · Organization/Decluttering $55/hr*

- **Pain:** a specific recurring household task (laundry, groceries, errands, organizing) is
  eating time the customer doesn't have.
- **Impact:** it's either not getting done, or it's costing them evenings/weekends.
- **Solution:** most of this family is bounded, fixed-price, single-visit work — easy to say
  yes to without a big commitment.
- **Investment:** quote the fixed price directly for fixed SKUs; for the hourly/variable ones
  (Closet Optimization, Estate Liquidation, Concierge/Personal Assistance, Errand Running, Home
  Inventory, Post-Event Reset, Organization/Decluttering), say it's billed hourly and offer the
  portal quote tool for an exact number.
- **Objections:**
  - *"I can do this myself"* — acknowledge it, then ask what's actually stopping them (time,
    physically difficult, don't want to). Don't push past a real "not interested."
  - *Timing* — offer to schedule for a specific week rather than "soon."

### C. Move & Transition Support
*Move/Transition Support $65/hr · Home Unpacking & Settling-In Support $55/hr*

- **Pain:** an upcoming or recent move, and the physical load of packing/unpacking/settling in.
- **Solution:** hourly support scoped to exactly what's needed — loading help, unpacking,
  settling a new space.
- **Investment:** hourly rate stated plainly; exact hours scoped via the quote tool.
- **Objections:** *Timing* is the dominant one here — moves are date-driven. Confirm the actual
  move date before promising anything.

### D. Recurring Programs
*Plant Care $89/month · Household Membership & Maintenance Program $149/month*

- **Pain:** ongoing upkeep (plants, general home maintenance) that's easy to let slide without a
  standing arrangement.
- **Solution:** this is the one family that's a real recurring commitment, not a one-time job —
  say that plainly upfront ("this is a monthly program, not a one-time visit") rather than
  letting them find out at checkout.
- **Investment:** monthly price stated directly, framed as monthly, never described as
  "one payment" or minimized.
- **Objections:**
  - *"I don't want a subscription"* — respect it immediately, offer the closest one-time SKU
    instead (e.g. a single Plant Care visit isn't currently a separate SKU — flag to Danielle
    if this comes up more than once, since it may be worth adding).
  - *Price* — no discount improvisation; if they want a lower commitment, that's a "no" for this
    SKU, not a negotiation.

### E. Property Readiness (resident-channel)
*Amenity Reset $95 · Apartment Turn $150 · Common Area Detail $125 · Facility Supply
Replenishment $125 · Make-Ready Cleaning $175 · Move-In Readiness $225 · Move-Out Readiness $150
· Office Cleaning $125 · Photo Documentation $125 · Property Inspection $150 · Vacant Property
Check $175*

- **Context:** these are priced under CH01-A but describe property-operations work — relevant to
  a resident who personally owns/manages a small rental unit, not a portfolio. If the caller
  turns out to represent a property management company or portfolio, **stop and hand off to the
  CH02 Sales Blitz motion** (`docs/SALES_BLITZ_EXECUTION_2026-09-05.md`) instead — different
  buyer, different sales motion, different pricing lane.
- **Pain/Solution/Investment:** same pattern as Group A — match scope to SKU, quote the exact
  starting price.

### F. Weddings & Ceremonies
*Wedding Officiant Services $295 · Vow Renewal Ceremonies $350*

- **Pain:** need a licensed officiant for a wedding or vow renewal.
- **Solution:** state exactly what's included per the catalog description (standard ceremony,
  one consultation call, travel/custom vows quoted separately) — don't oversell scope.
- **Investment:** flat price as listed.
- **Objections:** *Timing* — date/venue confirmation matters most here; don't promise
  availability without checking Danielle's calendar.

## 6. Disposition taxonomy (documented here — not yet a database table)

Per the design gate: the disposition table should not be built until the governed-catalog audit
above was complete. That audit is now done (§5), so this list is unblocked to become a real
table whenever that's wanted — but it hasn't been built yet, since there's no live calling
operation to log against.

- Reached — booked
- Reached — payment link sent
- Reached — quote needed
- Reached — follow-up requested
- Reached — no longer needs service
- Reached — price objection
- Reached — timing objection
- No answer
- Wrong number
- Do not contact
- Invalid/incomplete lead

## 7. Known gaps to close before this runs at any real volume

1. **No real lead pipeline yet** (§0) — the immediate priority is generating real inbound
   requests (the catalog/pricing/nav fixes shipped today should help), not staffing a calling
   operation against a nearly-empty list.
2. **CH01-B (verified resident discount) is unpriced** for all 61 of these SKUs
   (`ch01_b_priced: false` across the board) — a verified apartment resident calling in
   wouldn't currently get the discount channel, only standard CH01-A pricing.
3. **Contractor classification** — if this role is run with the same level of control as WWA's
   (fixed hours, mandatory script, monitored quota), that's cleaner as part-time W-2 than 1099;
   worth confirming with an employment attorney before hiring against this script.
4. **Payment mechanism** — confirm which existing flow (Quote Builder estimate → payment link,
   or direct `/request-service` → Stripe checkout) this script should route into by default;
   both exist today but serve slightly different intake paths.
