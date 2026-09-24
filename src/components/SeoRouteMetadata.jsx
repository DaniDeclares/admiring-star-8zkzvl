import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const ORIGIN = "https://danideclares.com";
const DEFAULT = {
  title: "DANI DECLARES LLC | Operations, Execution & Support",
  description: "DANI DECLARES provides mobile resident, property, real estate, business, event, field and institutional support across Metro Atlanta and regional South Carolina."
};

const ROUTES = {
  "/": DEFAULT,
  "/services": { title: "Services | DANI DECLARES", description: "Explore DANI DECLARES services for residents, property teams, real estate professionals, businesses and institutional clients." },
  "/resident-concierge": { title: "Resident Concierge | DANI DECLARES", description: "Mobile resident support for household resets, organization, document support and everyday execution needs." },
  "/services/property": { title: "Property & Apartment Support | DANI DECLARES", description: "Unit turns, field documentation, punch support, inspections and resident-experience services for property teams." },
  "/real-estate": { title: "Real Estate Support | DANI DECLARES", description: "Listing preparation, open-house support, field execution and administrative support for real estate professionals." },
  "/services/business-solutions": { title: "Business Support | DANI DECLARES", description: "Administrative, field, print, event and operational execution support for businesses." },
  "/industries/government": { title: "Government & Institutional Support | DANI DECLARES", description: "Facilities, administrative, field documentation, courier and program-logistics support for government and institutional buyers." },
  "/services/federal": { title: "Federal Contracting Capabilities | DANI DECLARES", description: "DANI DECLARES capabilities for federal facilities, administrative, field and program-support requirements." },
  "/services/facility-visits": { title: "Facility Visits & Field Documentation | DANI DECLARES", description: "On-site facility visits, inspections, photo documentation and field support across the DANI DECLARES service area." },
  "/services/events": { title: "Event Support | DANI DECLARES", description: "Setup, takedown, staging and execution support for business, property and community events." },
  "/services/print-studio": { title: "Print & Production Support | DANI DECLARES", description: "Business print, signage, apparel and production support through DANI DECLARES." },
  "/request-service": { title: "Request Service | DANI DECLARES", description: "Tell DANI DECLARES what needs to be handled. We will confirm scope, timing, service fit and pricing before work begins." },
  "/packages": { title: "Service Packages | DANI DECLARES", description: "Explore DANI DECLARES service packages and request a scope tailored to your needs." },
  "/membership": { title: "Membership | DANI DECLARES", description: "Explore recurring DANI DECLARES support options for eligible customers." },
  "/partner-network": { title: "Provider Network | DANI DECLARES", description: "Learn about the DANI DECLARES provider network and how qualified independent service providers can apply." },
  "/providers": { title: "Provider Access | DANI DECLARES", description: "Access information for qualified service providers working with the DANI DECLARES network.", noindex: true },
  "/about": { title: "About DANI DECLARES", description: "Learn how DANI DECLARES handles mobile operations, execution and support for customers across Metro Atlanta and regional South Carolina." },
  "/contact": { title: "Contact DANI DECLARES", description: "Contact DANI DECLARES for service, business and general inquiries." },
  "/blog": { title: "DANI DECLARES Blog", description: "Practical updates, service information and operational insights from DANI DECLARES." },
  "/terms": { title: "Terms | DANI DECLARES", description: "Terms governing use of DANI DECLARES services and website." },
  "/privacy": { title: "Privacy Policy | DANI DECLARES", description: "Read the DANI DECLARES privacy policy." }
};

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

export default function SeoRouteMetadata() {
  const { pathname } = useLocation();
  const path = normalizePath(pathname);
  const meta = ROUTES[path] || (path.startsWith("/blog/") ? {
    title: "DANI DECLARES Blog",
    description: "Service information and operational insights from DANI DECLARES."
  } : DEFAULT);
  const canonical = `${ORIGIN}${path === "/" ? "/" : path}`;
  const image = `${ORIGIN}/dani-declares-logo.svg`;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />
      {meta.noindex ? <meta name="robots" content="noindex,follow" /> : <meta name="robots" content="index,follow" />}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
