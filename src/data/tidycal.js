export const tidyCalBaseUrl = "https://tidycal.com/danideclaresns";

export const tidyCalEvents = {
  generalNotary: {
    label: "General Notary Appointment",
    slug: "15-minute-meeting",
  },
  loanSigning: {
    label: "Loan Signing",
    slug: "loan-signing",
  },
  apostille: {
    label: "Apostille Intake/Dropoff",
    slug: "apostille-intake-dropoff",
  },
  officiantConsultation: {
    label: "Officiant Consultation",
    slug: "officiant-consultation",
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
