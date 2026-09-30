import React from "react";
import { siteConfig, SITE_URL } from "../data/siteConfig.js";

const ORIGIN = SITE_URL;

const areaServed = [
  { "@type": "City", name: "Atlanta", addressCountry: "US" },
  { "@type": "City", name: "Doraville", addressCountry: "US" },
  { "@type": "City", name: "Dunwoody", addressCountry: "US" },
  { "@type": "City", name: "Stone Mountain", addressCountry: "US" },
  { "@type": "City", name: "Tucker", addressCountry: "US" },
  { "@type": "AdministrativeArea", name: "Metro Atlanta", addressCountry: "US" },
  { "@type": "AdministrativeArea", name: "Regional South Carolina", addressCountry: "US" }
];

export default function SeoStructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${ORIGIN}/#organization`,
    name: "DANI DECLARES LLC",
    url: ORIGIN,
    logo: `${ORIGIN}/dani-declares-logo.svg`,
    image: `${ORIGIN}/dani-declares-logo.svg`,
    telephone: siteConfig.phoneNumbers.public.tel,
    email: siteConfig.emails.admin,
    areaServed,
    sameAs: [\n      "https://www.google.com/maps/place/Dani+Declares+LLC/data=!4m2!3m1!1s0x0:0x89f6128572e1cc20"\n    ],\n    additionalType: "https://schema.org/ProfessionalService"
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${ORIGIN}/#website`,
    url: ORIGIN,
    name: "DANI DECLARES LLC",
    publisher: { "@id": `${ORIGIN}/#organization` }
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(organization)}</script>
      <script type="application/ld+json">{JSON.stringify(website)}</script>
    </>
  );
}
