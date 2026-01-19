import { getPriceLabel } from "./pricingCanon.js";
import { STRIPE_LINKS } from "./stripeLinks.js";

export const travelFeeDefaults = {
  baseRadiusMiles: 10,
  mileageRate: 1.0,
  baseTravelFee: 25,
  note:
    "Travel fees are calculated round trip using Google mileage. The base travel fee covers the first 10 miles round trip.",
};

export const notaryFeeDisclaimer =
  "Notary fees are set by state law ($10 per notarial act in GA, $5 per notarial act in SC). Mobile travel and convenience fees apply and are disclosed before service.";

export const serviceCatalog = [
  {
    id: "notary",
    name: "Mobile Notary",
    shortDesc:
      "On-site notarizations for personal and business documents with flexible scheduling.",
    category: "Notary",
    tidycalSlug: "danideclaresns/notary",
    actionType: "book",
    priceLabel: getPriceLabel("notary"),
    stripePaymentLink: STRIPE_LINKS.notary || null,
    highlights: [
      "State-compliant notarial acts",
      "Evening & weekend availability",
      "Travel fee disclosed before service",
    ],
  },
  {
    id: "poa",
    name: "IRS Power of Attorney (Form 2848)",
    shortDesc:
      "Notary support for IRS power of attorney filings and tax representation paperwork.",
    category: "Tax Season",
    actionType: "pay",
    priceLabel: getPriceLabel("poa"),
    stripePaymentLink: STRIPE_LINKS.poa || null,
    highlights: [
      "Same-day mobile appointments",
      "Ideal for tax professionals and firms",
      "Includes document verification",
    ],
  },
  {
    id: "i9",
    name: "I-9 Employment Verification",
    shortDesc:
      "Mobile I-9 verification for employers, HR teams, and remote hires.",
    category: "Tax Season",
    actionType: "pay",
    priceLabel: getPriceLabel("i9"),
    stripePaymentLink: STRIPE_LINKS.i9 || null,
    highlights: [
      "In-person identity verification",
      "Flexible scheduling for teams",
      "Fast confirmation turnaround",
    ],
  },
  {
    id: "apostille",
    name: "Apostille Facilitation",
    shortDesc:
      "Document authentication support with clear guidance for domestic and international use.",
    category: "Apostille",
    tidycalSlug: "danideclaresns/apostille",
    actionType: "book",
    priceLabel: getPriceLabel("apostille"),
    stripePaymentLink: STRIPE_LINKS.apostille || null,
    highlights: [
      "Step-by-step intake",
      "Drop-off coordination",
      "Status updates provided",
    ],
  },
  {
    id: "courier",
    name: "Secure Document Courier",
    shortDesc:
      "Secure pickup, delivery, and document handoff with real-time updates.",
    category: "Courier",
    actionType: "pay",
    priceLabel: getPriceLabel("courier"),
    stripePaymentLink: STRIPE_LINKS.courier || null,
    highlights: [
      "Same-day delivery options",
      "Chain-of-custody handling",
      "Perfect for legal filings",
    ],
  },
  {
    id: "loan_signing",
    name: "Loan Signing",
    shortDesc:
      "Certified signing agent support for purchase, refinance, and loan packages.",
    category: "Loan Signing",
    tidycalSlug: "danideclaresns/loansigning",
    actionType: "book",
    priceLabel: getPriceLabel("loan_signing"),
    stripePaymentLink: STRIPE_LINKS.loan_signing || null,
    highlights: [
      "NNA-certified signing agent",
      "Detailed document walkthroughs",
      "Scanbacks available on request",
    ],
  },
  {
    id: "trust_signing",
    name: "Trust & Estate Signing",
    shortDesc:
      "Mobile signing support for trusts, estate plans, and legal packets.",
    category: "Legal",
    tidycalSlug: "danideclaresns/loansigning",
    actionType: "book",
    priceLabel: getPriceLabel("trust_signing"),
    stripePaymentLink: STRIPE_LINKS.trust_signing || null,
    highlights: [
      "Trusted for sensitive documents",
      "Flexible on-site scheduling",
      "Professional witness coordination",
    ],
  },
  {
    id: "officiant_deposit",
    name: "Officiant Services",
    shortDesc:
      "Ceremony officiation for elopements, courthouse-style vows, and custom celebrations.",
    category: "Officiant",
    tidycalSlug: "danideclaresns/officiant",
    actionType: "book",
    priceLabel: getPriceLabel("officiant_deposit"),
    stripePaymentLink: STRIPE_LINKS.officiant_deposit || null,
    highlights: [
      "Personalized ceremony flow",
      "Support with filing guidance",
      "Travel coordination included",
    ],
  },
  {
    id: "advanced_legal",
    name: "Advanced Legal Support",
    shortDesc:
      "Complex legal document execution, witness coordination, and compliance support.",
    category: "Legal",
    actionType: "pay",
    priceLabel: getPriceLabel("advanced_legal"),
    stripePaymentLink: STRIPE_LINKS.advanced_legal || null,
    highlights: [
      "Multi-document packages",
      "Attorney coordination available",
      "Custom workflows on request",
    ],
  },
  {
    id: "federal_support",
    name: "Federal & Agency Support",
    shortDesc:
      "Document handling, verification, and compliance support for federal partners.",
    category: "Federal",
    actionType: "pay",
    priceLabel: getPriceLabel("federal_support"),
    stripePaymentLink: STRIPE_LINKS.federal_support || null,
    highlights: [
      "NAICS-aligned services",
      "Secure document handling",
      "Available for direct contracts",
    ],
  },
];

export const getServiceById = (serviceId) =>
  serviceCatalog.find((service) => service.id === serviceId);
