# DANI DECLARES LLC — Sales/Client Development Contractor Agreement

**DRAFT / ATTORNEY REVIEW REQUIRED BEFORE THIS GOVERNS A REAL SIGNATURE**

This is a separate track from `DANI_PROVIDER_AGREEMENT_DRAFT.md`. That document
covers Providers who are dispatched to perform a service (cleaning, courier,
concierge work, etc.). This one covers Contractors engaged to develop or close
business by phone/outreach — qualifying leads, presenting DANI's services, and
directing prospects to a paid engagement. Use whichever track matches the
actual work; a person can be signed under both if they genuinely do both.

**A note on independent contractor status before you fill this in:** the more
this agreement (or the training/monitoring layered on top of it) locks down
*exactly* when someone works, *exactly* what they say, and requires them to
install remote-access software so DANI can inspect their computer, the harder
it is to defend contractor status if it's ever challenged by a state agency or
the IRS. If the role genuinely needs fixed hours, a mandatory script, and
remote device access, say so plainly to counsel before signing anyone — don't
paper over an employment relationship with an IC label. This draft is written
to leave scheduling and method as contractor-controlled by default; tighten it
only with legal sign-off.

## 1. Relationship

This agreement states the parties' intent: the signer ("Contractor") is
engaged as an independent contractor, not an employee, partner, or agent, and
is responsible for their own taxes, insurance, equipment, and benefits. DANI
does not withhold taxes or provide employee benefits.

That stated intent does not by itself decide the legal classification — it
depends on the whole relationship in fact, not this document's label. Training,
a required call framework, compliance instructions, coaching/evaluation, and
DANI-approved leads and pricing (all present in this program — see Sections 2,
4, and 5, and the training guide) are exactly the kind of behavioral-control
factors the IRS and state agencies weigh when they look past a contract's
label. Have counsel review the actual program, including whether and how
training runs, before treating this document as having settled the question.

## 2. Scope of Work

Contractor will contact prospects provided or approved by DANI, qualify
interest against DANI's current service catalog, and present pricing/quotes
generated through DANI's own tools (the quote builder / estimate flow).
Contractor may propose their own approach to reaching and engaging prospects;
DANI's role is to approve the offer, pricing, and any claims made about the
service — not to dictate a fixed script or minute-by-minute schedule, unless a
signed schedule addendum says otherwise.

## 3. Compensation

Compensation (base, per-engagement, and/or commission) is set out in a
compensation schedule DANI provides at the time of engagement, not invented or
negotiated inside this agreement. Whatever that schedule says about proration,
minimums, and payment timing controls. Payment is processed through DANI's
contractor payroll system (see the in-portal onboarding flow) via direct
deposit; Contractor is responsible for completing that onboarding accurately,
including a correct W-9.

Any discretionary bonus is exactly that — discretionary, disclosed when
offered, and never a substitute for the base schedule.

## 4. Training

DANI may offer a paid or unpaid training/ramp period; which one, and its
length, must be stated in writing before it starts. If a paid training period
is offered, Contractor is paid for time actually spent training regardless of
whether Contractor continues past it — a person does not forfeit pay already
earned because DANI later decides not to continue the engagement. DANI may end
training and decline to continue the engagement at its discretion; that
decision does not claw back pay for training already completed.

## 5. How Contractor Represents DANI

Contractor will represent DANI's services, pricing, and policies accurately.
Specifically, Contractor will not:

- Claim a discount, deadline, or "spot" is scarce or about to expire unless
  that is actually true and DANI has authorized the specific claim in writing;
- Discourage a prospect from taking time to decide, consulting someone else,
  or asking for something in writing;
- Misstate DANI's cancellation, refund, or guarantee policy — state it as
  written in the current customer-facing terms;
- Represent DANI's pricing as an "exception" or "compliment" when it is
  actually the standard listed price.

These aren't just tone guidelines — several are direct requirements of the
FTC Telemarketing Sales Rule and state telemarketing/consumer-protection
statutes, and liability under those can attach to the individual caller, not
only to DANI. See `DANI_SALES_CONTRACTOR_TRAINING_GUIDE_DRAFT.md` for the
compliance checklist in full.

## 6. Payment Collection — No Card Numbers by Voice or Chat

Contractor never collects, writes down, or repeats back a customer's full
card number, CVV, or bank account/routing number by phone, text, email, or any
chat tool (Teams, Slack, SMS, etc.), regardless of what the payment path
underneath turns out to be. This is DANI policy, not a judgment call, and it
is the one practice from other programs that must never be copied here:
manual capture of card data expands what falls inside PCI scope and DANI
prohibits it outright. Separately, and regardless of how payment is captured,
CVV/other sensitive authentication data must never be retained after
authorization — that retention, specifically, is what PCI DSS itself
prohibits.

Where it's actually available, Contractor's job is to get the customer to
DANI's hosted Stripe Checkout link generated from their service request/
estimate (see `api/create-checkout-session.js`), not to take payment details
directly. That link only exists today for Resident Concierge (channel CH01)
requests that are live, sell-now, fulfillment-ready, and priced — a one-time
quote-priced sale can still checkout for a deposit once its estimate is
approved and cleared, but a **recurring** quote-priced sale is blocked from
checkout entirely pending owner review, and every other channel (apartment,
real-estate, B2B, or government/B2G business) has no checkout link at all
right now. For any of those non-checkout-eligible cases, escalate to DANI's
finance/ops contact for the governed invoicing path rather than improvising —
and that governed path is itself a gap DANI needs to build, not something
this document invents. Whatever the path, the rule above holds: no card
numbers or CVVs by voice or chat, ever, as a workaround.

## 7. Confidentiality

Contractor will keep confidential any customer, lead, pricing, or operational
information encountered while performing DANI-authorized work, will not copy
or export it outside DANI-approved systems, and will not use lead/customer
information for any purpose other than DANI-authorized work, during or after
this engagement.

## 8. Work Product

Materials Contractor creates specifically for DANI in the course of this
engagement (call notes, customized pitch materials, recordings made on DANI's
system) belong to DANI. This does not reach Contractor's own pre-existing
tools, scripts, or general sales know-how brought into the engagement.

## 9. Conflicts of Interest

Contractor will disclose, before or promptly after it arises, any interest
that could conflict with representing DANI honestly (e.g., selling a
competing service to the same prospects).

## 10. Termination

Either party may end this relationship at any time, for any reason, on
notice. Termination does not affect compensation already earned, or
Contractor's confidentiality obligations under Section 7.

## 11. No Reclassification Indemnity

Unlike some contractor agreements, this one does not require Contractor to
indemnify DANI if the engagement is later found to be an employment
relationship rather than a true IC relationship. That risk sits with whoever
controlled how the work was structured — DANI — and shifting it onto the
individual contractor by contract is both unfair and, in a number of states,
not enforceable anyway. Get counsel's view on classification risk instead of
trying to contract around it.

## 12. Governing Law

Governing law and venue are to be specified after attorney review based on
DANI's actual state of formation and primary operating jurisdiction.

## 13. Entire Agreement

This document, together with any signed compensation schedule or
service-specific addendum, is the entire agreement between the parties
regarding Contractor's sales/client-development work for DANI, unless a
separately signed writing says otherwise.

---

By typing your full legal name and submitting the signature form in the DANI
DECLARES contractor portal, you affirm that you have read and agree to be
bound by the terms above as in effect on the date shown at signing.

**Implementation note (not part of the signed text):** "as in effect on the
date shown at signing" only means something if the portal actually preserves
what that means. At the moment of signature, store an immutable snapshot —
this agreement's version/hash, the compensation schedule's version, and the
signed timestamp, together — so a later edit to either document can never
make it ambiguous which terms and rates a given signature actually covers.
