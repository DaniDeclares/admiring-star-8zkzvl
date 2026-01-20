import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { getPriceLabel } from "../data/pricingCanon.js";
import {
  bookingServices,
  getBookingServiceById,
} from "../data/bookingServices.js";
import { siteConfig } from "../data/siteConfig.js";
import "./PayPage.css";

const SERVICE_ID_ALIASES = {
  loan_signing: "loansigning",
  officiant_deposit: "officiant",
};

export default function PayPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const rawServiceId = params.get("service") || "notary";
  const resolvedServiceId = SERVICE_ID_ALIASES[rawServiceId] || rawServiceId;
  const selectedServiceId = getBookingServiceById(resolvedServiceId)
    ? resolvedServiceId
    : "notary";
  const selectedService = useMemo(
    () => getBookingServiceById(selectedServiceId),
    [selectedServiceId]
  );
  const showMissingPaymentLink = Boolean(
    selectedService && !selectedService.paymentUrl
  );
  const priceLabel =
    selectedServiceId ? getPriceLabel(selectedServiceId) : null;
  const hasValidService = Boolean(selectedService);
  const otherServices = bookingServices.filter(
    (service) => service.id !== selectedServiceId
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
            Your appointment is pending until payment is completed. Unpaid bookings
            are released.
          </p>
          <p>
            Select your service to complete payment. If you still need to book a
            time, start on the{" "}
            <Link
              to={selectedService ? `/book?service=${selectedService.id}` : "/book"}
            >
              booking page
            </Link>
            .
          </p>
        </header>

        <section className="pay-details pay-cards">
          <article className="pay-card">
            {!hasValidService && (
              <>
                <h2>Select a service to pay for</h2>
                <p>
                  Choose a service to see the payment options and confirmation
                  steps.
                </p>
                <Link className="btn btn--primary btn--block" to="/services">
                  Browse Services
                </Link>
              </>
            )}
            {hasValidService && (
              <>
                <h2>{selectedService.name}</h2>
                <p>{selectedService.description}</p>
                {priceLabel && <p className="pay-card__price">{priceLabel}</p>}
                <p className="pay-card__stripe-note">
                  Step 2 — Pay deposit to confirm. Deposits are non-refundable and
                  applied to your total.
                </p>
                {selectedService.paymentUrl && (
                  <a
                    className="btn btn--primary btn--block"
                    href={selectedService.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedService.payLabel || "Pay Deposit"}
                  </a>
                )}
                {showMissingPaymentLink && (
                  <div className="pay-card__fallback">
                    <p>Payment link not configured. Please contact us.</p>
                    <div className="pay-card__fallback-actions">
                      <a
                        className="btn btn--secondary"
                        href={`tel:${siteConfig.phoneNumbers.primary.tel}`}
                      >
                        Call/Text {siteConfig.phoneNumbers.primary.display}
                      </a>
                      <a
                        className="btn btn--secondary"
                        href={`mailto:${siteConfig.emails.admin}`}
                      >
                        Email {siteConfig.emails.admin}
                      </a>
                      <Link className="btn btn--secondary" to="/services">
                        Back to Services
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </article>
        </section>

        <section className="pay-alternates">
          <h2>Other Services</h2>
          <div className="pay-alternates__grid">
            {otherServices.map((service) => (
              <article key={service.id} className="pay-alt-card">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
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
