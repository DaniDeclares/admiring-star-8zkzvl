import React, { useMemo, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { getStripeLink, isValidStripeUrl } from "../config/stripeLinks.js";
import { bookingServices, paymentServices } from "../data/services.js";
import "./PayPage.css";

const formatPrice = (price) =>
  typeof price === "number" ? `$${price}` : price;

const INVALID_PAYMENT_MESSAGE =
  "Service temporarily unavailable — call/text (864) 326-5362 or email admin@danideclares.com.";

export default function PayPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const requestedServiceId = params.get("service");
  const paymentOptions = useMemo(
    () =>
      paymentServices.map((service) => ({
        ...service,
        serviceId: service.bookingServiceId || service.id,
      })),
    [paymentServices]
  );
  const serviceLookup = useMemo(() => {
    const lookup = new Map();
    paymentOptions.forEach((service) => {
      lookup.set(service.serviceId, service);
      if (service.id && service.id !== service.serviceId) {
        lookup.set(service.id, service);
      }
    });
    return lookup;
  }, [paymentOptions]);
  const requestedService = requestedServiceId
    ? serviceLookup.get(requestedServiceId)
    : null;
  const [selectedServiceId, setSelectedServiceId] = useState("");

  useEffect(() => {
    if (!requestedServiceId) {
      setSelectedServiceId("");
      return;
    }

    if (requestedService) {
      setSelectedServiceId(requestedService.serviceId);
    } else {
      setSelectedServiceId("");
    }
  }, [requestedServiceId, requestedService]);

  const activeService =
    requestedService ||
    (selectedServiceId ? serviceLookup.get(selectedServiceId) : null);
  const isSelectionRequired = !requestedService;

  const priceLabel = useMemo(
    () => (activeService ? formatPrice(activeService.price) : null),
    [activeService]
  );
  const bookingServiceId =
    activeService?.bookingServiceId || bookingServices[0]?.id || "notary";
  const payLinkUrl = activeService
    ? activeService.stripePaymentLink || getStripeLink(activeService.catalogKey)
    : "";
  const isValidPayLinkUrl = isValidStripeUrl(payLinkUrl);
  const hasInvalidRequestedService =
    Boolean(requestedServiceId) && !requestedService;
  const showFallbackContact =
    hasInvalidRequestedService || (activeService && !isValidPayLinkUrl);

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
            Payment required to confirm. Complete payment securely without leaving
            the site—your appointment is pending until payment is completed.
          </p>
          <p>
            Need to schedule a time? Start on the{" "}
            <Link to={`/book?service=${bookingServiceId}`}>booking page</Link>.
          </p>
        </header>

        {hasInvalidRequestedService && (
          <section className="pay-warning">
            <h2>Select a service to pay</h2>
            <p>
              The payment link you requested is unavailable. Please choose a service
              below or contact us for help.
            </p>
          </section>
        )}

        {showFallbackContact && !activeService && (
          <section className="pay-details">
            <div className="pay-card__fallback" role="status">
              <strong>Service not available.</strong>
              <p>{INVALID_PAYMENT_MESSAGE}</p>
              <div className="pay-card__fallback-actions">
                <a href="tel:18643265362">Call/Text (864) 326-5362</a>
                <a href="mailto:admin@danideclares.com">
                  Email admin@danideclares.com
                </a>
              </div>
            </div>
          </section>
        )}

        {isSelectionRequired && (
          <section className="pay-selection">
            <h2>Select a service</h2>
            <div className="pay-selection__control">
              <label htmlFor="pay-service-select">Service</label>
              <select
                id="pay-service-select"
                value={selectedServiceId}
                onChange={(event) => setSelectedServiceId(event.target.value)}
              >
                <option value="">Choose a service</option>
                {paymentOptions.map((service) => (
                  <option key={service.serviceId} value={service.serviceId}>
                    {service.title}
                  </option>
                ))}
              </select>
            </div>
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
                Step 2 — Payment required to confirm. Pay now; deposits are
                non-refundable and applied to your total.
              </p>
              <div>
                <button
                  className="btn btn--primary btn--block"
                  type="button"
                  disabled={!activeService || !isValidPayLinkUrl}
                  onClick={() => window.location.assign(payLinkUrl)}
                >
                  Pay Now
                </button>
                {showFallbackContact && (
                  <div className="pay-card__fallback" role="status">
                    <strong>Service not available.</strong>
                    <p>{INVALID_PAYMENT_MESSAGE}</p>
                    <div className="pay-card__fallback-actions">
                      <a href="tel:18643265362">Call/Text (864) 326-5362</a>
                      <a href="mailto:admin@danideclares.com">
                        Email admin@danideclares.com
                      </a>
                    </div>
                  </div>
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

      </main>
    </>
  );
}
