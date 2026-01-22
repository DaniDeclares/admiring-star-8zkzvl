export const tidyCalBaseUrl = "https://tidycal.com/danideclaresns";

export const tidyCalEvents = {
  generalNotary: {
    label: "General Notary Appointment",
    slug: "notary",
  },
  loanSigning: {
    label: "Loan Signing",
    slug: "loansigning",
  },
  apostille: {
    label: "Apostille Intake/Dropoff",
    slug: "apostille",
  },
  officiantConsultation: {
    label: "Officiant Consultation",
    slug: "officiant",
  },
  sipSignSocial: {
    label: "Sip & Sign Social",
    slug: "sip-sign",
  },
  financialQuote: {
    label: "Financial Quote Call",
    slug: "15-minute-meeting",
  },
};

export const buildTidyCalPath = (slug) => `danideclaresns/${slug}`;
export const buildTidyCalUrl = (slug) => `${tidyCalBaseUrl}/${slug}`;
