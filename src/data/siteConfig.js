const publicPhone = {
  display: "(470) 485-7173",
  tel: "+14704857173",
};

const scPhone = {
  display: "(470) 682-9348",
  tel: "+14706829348",
};

export const SHOW_FESTIVAL = false;

// Canonical production origin for links embedded in outbound emails (signup
// confirmation, password reset). Deliberately NOT window.location.origin:
// this app is also reachable at Vercel preview/branch URLs, and at least two
// real people (a provider application and a password-reset-equivalent flow)
// got emailed a confirmation link pointing at a Vercel preview deployment
// instead of the real site -- Vercel's own deployment-protection login page
// intercepted them before they ever reached DANI DECLARES. Whatever origin
// happened to be loaded when the form was submitted must never end up in an
// email; it must always be the real public domain.
export const SITE_URL = "https://danideclares.com";

export const siteConfig = {
  serviceAreaText: "Serving Atlanta, Doraville, Dunwoody, and beyond.",
  phoneNumbers: {
    // Public call/text line - use in all public-facing CTAs
    public: publicPhone,
    // SC-specific line - only show when clearly labeled for South Carolina use
    sc: scPhone,
    // Temporary compatibility aliases for older pages/components.
    // New code should use phoneNumbers.public or phoneNumbers.sc directly.
    primary: publicPhone,
    secondary: scPhone,
  },
  emails: {
    admin: "admin@danideclares.com",
    events: "events@danideclares.com",
    notary: "danideclaresllc@gmail.com",
    // Use for vendor, property manager, procurement, and subcontractor inquiries
    vendor: "vendors@danideclares.com",
  },
};
