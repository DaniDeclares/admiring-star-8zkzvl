const publicPhone = {
  display: "(470) 485-7173",
  tel: "+14704857173",
};

export const SHOW_FESTIVAL = false;

export const siteConfig = {
  serviceAreaText: "Serving Metro Atlanta and surrounding Georgia markets.",
  phoneNumbers: {
    // Public call/text line - use in all public-facing CTAs
    public: publicPhone,
    // Compatibility aliases for older pages/components.
    primary: publicPhone,
    secondary: publicPhone,
  },
  emails: {
    admin: "admin@danideclares.com",
    events: "events@danideclares.com",
    notary: "danideclaresllc@gmail.com",
    // Use for vendor, property manager, procurement, and subcontractor inquiries
    vendor: "vendors@danideclares.com",
  },
};
