codex/redesign-danideclares.com-for-service-booking
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { paymentServices, getServiceById } from "../data/services.js";
import "./PayPage.css";

export default function PayPage() {
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("service");
  const selectedService = getServiceById(selectedId);
  const isPaymentService = selectedService?.actionType === "pay";
=======
import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import StripeBuyButton from "../components/StripeBuyButton.jsx";
import { SERVICES, STRIPE_PUBLISHABLE_KEY } from "../data/servicesCatalog.js";
import { siteConfig } from "../data/siteConfig.js";
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
  additional_signature_set: "notary",
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
  const primaryPhone = siteConfig.phoneNumbers.primary;
  const bookingServiceKey = BOOKING_SERVICE_MAP[selectedServiceKey] || "notary";
  const otherServices = Object.entries(SERVICES).filter(
    ([serviceKey]) => serviceKey !== selectedServiceKey
  );
  const payLinkUrl = selectedService?.payLinkUrl;
  const isValidPayLinkUrl =
    typeof payLinkUrl === "string" && payLinkUrl.startsWith("https://");
  return (
    <>
      <Helmet>
codex/redesign-danideclares.com-for-service-booking
        <title>Complete Payment • Dani Declares</title>
        <meta
          name="description"
          content="Complete payment for your booked Dani Declares service."
=======
        <title>Pay to Confirm • Dani Declares</title>
        <meta
          name="description"
          content="Complete payment to confirm your Dani Declares appointment."

        />
      </Helmet>

      <main className="pay-page">
        <header className="pay-hero">
codex/redesign-danideclares.com-for-service-booking
          <p className="eyebrow">Secure Payment</p>
          <h1>Confirm Your Appointment</h1>
          <p>
            Booking always happens before payment. Payment confirms your appointment
            and finalizes your time slot.
          </p>
        </header>

        {!isPaymentService && (
          <section className="pay-warning">
            <h2>Select a service to pay</h2>
            <p>
              Please choose a service so we can route you to the correct payment
              link. Payments without a service selection are not accepted.
            </p>
            <div className="pay-actions">
              <Link to="/services" className="btn btn--primary">
                View Services
              </Link>
              <Link to="/book" className="btn btn--secondary">
                Book First
              </Link>
            </div>
          </section>
        )}

        {isPaymentService && (
          <section className="pay-card">
            <div>
              <h2>{selectedService.title}</h2>
              <p>{selectedService.shortDescription}</p>
            </div>
            <div className="pay-card__cta">
              <a
                className="btn btn--primary"
                href={selectedService.stripePaymentLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay securely with Stripe
              </a>
              <p className="pay-note">
                Your appointment stays pending until payment is completed. Unpaid
                bookings may be released.
              </p>
            </div>
          </section>
        )}

        <section className="pay-service-grid">
          <h2>Available payment links</h2>
          <div className="service-grid">
            {paymentServices.map((service) => (
              <Link
                key={service.id}
                className="service-card"
                to={`/pay?service=${service.id}`}
              >
                <h3>{service.title}</h3>
                <p>{service.shortDescription}</p>
                <span className="service-action">Pay now</span>
              </Link>
=======
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
              ) : isValidPayLinkUrl ? (
                <a
                  className="btn btn--primary btn--block"
                  href={payLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pay Now
                </a>
              ) : (
                <>
                  <button className="btn btn--primary btn--block" disabled>
                    Pay Now
                  </button>
                  <p>
                    Booking temporarily unavailable — call/text{" "}
                    {primaryPhone.display}
                  </p>
                </>
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
