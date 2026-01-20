import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import StripeBuyButton from "../components/StripeBuyButton.jsx";
import { SERVICES, STRIPE_PUBLISHABLE_KEY } from "../data/servicesCatalog.js";
import "./PayPage.css";

const SERVICE_ID_ALIASES = {
  notary: "mobile_notary",
  loansigning: "loan_signing",
  loan_signing: "loan_signing",
  trust: "trust_signing",
  trust_signing: "trust_signing",
};

const BOOKING_SERVICE_MAP = {
  mobile_notary: "notary",
  poa: "notary",
  i9: "notary",
  apostille: "apostille",
  loan_signing: "loansigning",
  trust_signing: "loansigning",
  printing_scanning: "notary",
  travel_fee: "notary",
  additional_notarization: "notary",
  process_serving: "notary",
  court_courier: "notary",
  digital_court_reporting: "notary",
  legal_doc_prep: "notary",
  field_property_inspections: "notary",
  mobile_closing_services: "loansigning",
  general_document_signing: "notary",
  trust_signing_agent: "loansigning",
};

const formatPrice = (price) =>
  typeof price === "number" ? `$${price}` : price;

export default function PayPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const rawServiceKey = params.get("service") || "mobile_notary";
  const resolvedServiceKey = SERVICE_ID_ALIASES[rawServiceKey] || rawServiceKey;
  const selectedServiceKey = SERVICES[resolvedServiceKey]
    ? resolvedServiceKey
    : "mobile_notary";
  const selectedService = SERVICES[selectedServiceKey];
  const priceLabel = useMemo(
    () => (selectedService ? formatPrice(selectedService.price) : null),
    [selectedService]
  );
  const bookingServiceKey = BOOKING_SERVICE_MAP[selectedServiceKey] || "notary";
  const otherServices = Object.entries(SERVICES).filter(
    ([serviceKey]) => serviceKey !== selectedServiceKey
  );

  return (
    <>
      <Helmet>
        <title>Pay to Confirm • Dani Declares</title>
        <meta
          name="description"
          content="Complete payment to confirm your Dani Declares appointment."
        />
      </Helmet>

      <main className="pay-page">
        <header className="pay-hero">
          <p className="pay-eyebrow">Step 2</p>
          <h1>Pay to Confirm</h1>
          <p>
            Complete payment securely without leaving the site. Your appointment is
            pending until payment is completed.
          </p>
          <p>
            Need to schedule a time? Start on the{" "}
            <Link to={`/book?service=${bookingServiceKey}`}>booking page</Link>.
          </p>
        </header>

        <section className="pay-details pay-cards">
          <article className="pay-card">
            <h2>{selectedService.label}</h2>
            {priceLabel && <p className="pay-card__price">Total: {priceLabel}</p>}
            <p className="pay-card__stripe-note">
              Step 2 — Pay now to confirm. Deposits are non-refundable and applied
              to your total.
            </p>
            <div>
              {selectedService.buyButtonId ? (
                <StripeBuyButton
                  buyButtonId={selectedService.buyButtonId}
                  publishableKey={STRIPE_PUBLISHABLE_KEY}
                />
              ) : selectedService.payLinkUrl ? (
                <a
                  className="btn btn--primary btn--block"
                  href={selectedService.payLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pay Now
                </a>
              ) : (
                <p>Payment option coming soon. Please contact us.</p>
              )}
            </div>
            <div>
              <h3>Book for later</h3>
              <a
                className="btn btn--secondary btn--block"
                href={
                  selectedService.tidycalUrl ||
                  "https://tidycal.com/danideclaresns/notary"
                }
                target="_blank"
                rel="noreferrer"
              >
                Schedule Appointment
              </a>
            </div>
          </article>
        </section>

        <section className="pay-alternates">
          <h2>Other Services</h2>
          <div className="pay-alternates__grid">
            {otherServices.map(([serviceKey, service]) => (
              <article key={serviceKey} className="pay-alt-card">
                <h3>{service.label}</h3>
                <p>Total: {formatPrice(service.price)}</p>
                <Link
                  className="btn btn--secondary btn--block"
                  to={`/pay?service=${serviceKey}`}
                >
                  View &amp; Pay
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
