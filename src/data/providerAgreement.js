// filename: src/data/providerAgreement.js
// Mirrors docs/templates/DANI_PROVIDER_AGREEMENT_DRAFT.md -- keep both in
// sync if the text changes. DRAFT / ATTORNEY REVIEW REQUIRED before this
// governs a real signature; see that file's header for why.

export const PROVIDER_AGREEMENT_VERSION = 'PROVIDER_AGREEMENT_DRAFT_V1_2026-09-16';

export const PROVIDER_AGREEMENT_SECTIONS = [
  { heading: '1. Relationship', body: 'Signing this agreement does not create employment, partnership, or agency. The signer ("Provider") is an independent contractor. DANI DECLARES LLC ("DANI") does not control the manner or means by which Provider performs authorized work, only the result.' },
  { heading: '2. Scope of Authorization', body: "Provider may only perform work DANI has expressly authorized for the specific service(s)/SKU(s) reviewed and approved on Provider's application. Signing this agreement does not itself authorize any service -- authorization requires DANI's separate, completed review of Provider's qualifications, credentials, insurance, and compliance documentation for each service." },
  { heading: '3. No Guarantee of Work', body: 'Network access is not a guarantee of work, a minimum number of jobs, or any minimum income. DANI may decline to offer, or may withdraw, any assignment.' },
  { heading: '4. Compliance and Licensing', body: "Provider is responsible for holding and maintaining any license, permit, certification, or insurance legally required for the service(s) Provider is authorized to perform, and for promptly notifying DANI if any such requirement lapses. DANI may suspend or terminate authorization for a service if compliance information expires or becomes insufficient." },
  { heading: '5. Compensation', body: "Provider is paid per completed, verified job according to the payout terms DANI has established for the authorized service -- DANI's governed pricing and payout schedule control, not a rate Provider proposes." },
  { heading: '6. Confidentiality', body: 'Provider will keep confidential any customer, property, financial, or operational information encountered while performing DANI-dispatched work, and will use it only to perform that work.' },
  { heading: '7. Termination', body: "Either party may end this relationship at any time. Termination does not affect payment already earned for completed, verified work, or Provider's confidentiality obligations under Section 6." },
  { heading: '8. No Warranty / Limitation', body: 'DANI makes no warranty regarding the volume, timing, or profitability of any work offered under this agreement.' },
  { heading: '9. Governing Law', body: "Governing law and venue are to be specified after attorney review based on DANI's actual state of formation and primary operating jurisdiction." },
  { heading: '10. Entire Agreement', body: 'This document, together with any signed service-specific schedule or company-specific vendor paperwork Provider submits, is the entire agreement between the parties regarding Provider’s service to DANI unless a separately signed writing says otherwise.' },
];
