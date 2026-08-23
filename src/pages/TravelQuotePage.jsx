import React from "react";
import { Helmet } from "react-helmet-async";
import ServiceCta from "../components/ServiceCta.jsx";
import "./TravelQuotePage.css";

/**
 * Legacy travel-calculator route retained only for compatibility.
 *
 * DANI DECLARES no longer exposes the retired mileage/per-mile pricing
 * engine. Geographic treatment is governed by market/service-area rules and
 * the reconciled commercial record. This page therefore routes customers to
 * governed intake instead of calculating a legacy travel fee.
 */
export default function TravelQuotePage() {
  return (
    <main className="travel-quote-page">
      <Helmet>
        <title>Service Area & Scope Review • Dani Declares</title>
        <meta
          name="description"
          content="Request a service-area and scope review. Geographic treatment is determined by the current commercial architecture."
        />
      </Helmet>

      <header className="travel-quote-hero">
        <h1>Service Area & Scope Review</h1>
        <p>
          We no longer use the retired mileage or per-mile travel-fee engine.
          Your service request is evaluated using the current market, service
          area, scope, channel, and commercial rules.
        </p>
      </header>

      <section className="travel-quote-form">
        <h2>Request service</h2>
        <p>
          Submit your location and service needs through the governed intake
          process. If a current customer price is not yet authorized, the
          request will be routed for scope review rather than using a legacy
          price or travel formula.
        </p>
        <ServiceCta
          serviceId="CAP-05A-NOTARY"
          bookingLabel="Request a Service Review"
        />
      </section>
    </main>
  );
}
