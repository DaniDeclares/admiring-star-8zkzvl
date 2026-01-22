import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import StripeBuyButton from "../components/StripeBuyButton.jsx";
import { getStripeLink, isValidStripeUrl } from "../config/stripeLinks.js";
import { bookingServices, paymentServices } from "../data/services.js";
import { STRIPE_PUBLISHABLE_KEY } from "../data/servicesCatalog.js";
import "./PayPage.css";

const formatPrice = (price) =>
  typeof price === "number" ? `$${price}` : price;

const INVALID_PAYMENT_MESSAGE =
  "Booking temporarily unavailable — call/text (864) 326-5263";

export default function PayPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const requestedServiceId = params.get("service");
  const serviceLookup = useMemo(
    () => new Map(paymentServices.map((service) => [service.id, service])),
    [paymentServices]
  );
  const selectedService = requestedServiceId
    ? serviceLookup.get(requestedServiceId)
    : null;
  const fallbackService = paymentServices[0] || null;
  const activeService = selectedService || fallbackService;
  const isValidSelection = Boolean(selectedService);

  const priceLabel = useMemo(
    () => (activeService ? formatPrice(activeService.price) : null),
    [activeService]
  );
  const bookingServiceId =
    activeService?.bookingServiceId ||
    bookingServices[0]?.id ||
    "notary";
  const payLinkUrl = activeService
    ? activeService.stripePaymentLink || getStripeLink(activeService.catalogKey)
    : "";
  const isValidPayLinkUrl = isValidStripeUrl(payLinkUrl);
  const otherServices = paymentServices.filter(
    (service) => service.id !== activeService?.id
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
            <Link to={`/book?service=${bookingServiceId}`}>booking page</Link>.
          </p>
        </header>

        {!isValidSelection && requestedServiceId && (
          <section className="pay-warning">
            <h2>Select a service to pay</h2>
            <p>
              The payment link you requested is unavailable. Please choose a service
              below to continue.
            </p>
          </section>
        )}

        {activeService && (
          <section className="pay-details pay-cards">
            <article className="pay-card">
              <h2>{activeService.title}</h2>
              {priceLabel && (
                <p className="pay-card__price">Total: {priceLabel}</p>
              )}
              <p className="pay-card__stripe-note">
                Step 2 — Pay now to confirm. Deposits are non-refundable and applied
                to your total.
              </p>
              <div>
                {activeService.buyButtonId ? (
                  <StripeBuyButton
                    buyButtonId={activeService.buyButtonId}
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
                    <p>{INVALID_PAYMENT_MESSAGE}</p>
                  </>
                )}
              </div>
              <div>
                <h3>Book for later</h3>
                <a
                  className="btn btn--secondary btn--block"
                  href={
                    activeService.tidycalUrl ||
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
        )}

        <section className="pay-alternates">
          <h2>Other Services</h2>
          <div className="pay-alternates__grid">
            {otherServices.map((service) => (
              <article key={service.id} className="pay-alt-card">
                <h3>{service.title}</h3>
                {service.price !== null && service.price !== undefined && (
                  <p>Total: {formatPrice(service.price)}</p>
                )}
                <Link
                  className="btn btn--secondary btn--block"
                  to={`/pay?service=${service.id}`}
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
