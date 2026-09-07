const publicPhone = {
  display: "(470) 485-7173",
  tel: "+14704857173",
};

const scPhone = {
  display: "(470) 682-9348",
  tel: "+14706829348",
};

export const SHOW_FESTIVAL = false;

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
