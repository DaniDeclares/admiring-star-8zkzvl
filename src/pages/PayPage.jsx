import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import HubSpotForm from "../components/HubSpotForm.jsx";
import {
  getPaymentServiceById,
  notaryFeeDisclaimer,
} from "../data/services.js";
import { getPriceLabel } from "../data/pricingCanon.js";
import { siteConfig } from "../data/siteConfig.js";
import "./PayPage.css";

export default function PayPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedServiceId = params.get("service");
  const selectedService = getPaymentServiceById(selectedServiceId);
  const priceLabel = selectedServiceId
    ? selectedService?.priceLabel || getPriceLabel(selectedServiceId)
    : null;
  const bookingServiceId = selectedService?.bookingServiceId;
  const invoiceFormId = "d4cd290e-7766-4bf5-91a2-c1274ddd882e";
  const invoiceLink = selectedServiceId
    ? `/contact?service=${encodeURIComponent(selectedServiceId)}`
    : "/contact";
  const fallbackRequestLink = invoiceFormId ? "#invoice-form" : invoiceLink;

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
            may be released.
          </p>
          <p>
            Select your service below to complete payment. If you still need to
            book a time, start on the{" "}
            <Link to={bookingServiceId ? `/book?service=${bookingServiceId}` : "/book"}>
              booking page
            </Link>
            .
          </p>
        </header>

        {!selectedServiceId || !selectedService ? (
          <section className="pay-options">
            <article className="pay-card">
              <h2>Select a service to pay for</h2>
              <p>
                Choose a service on the services page to see the correct payment
                option.
              </p>
              <Link className="btn btn--primary" to="/services">
                View Services
              </Link>
            </article>
          </section>
        ) : (
          <section className="pay-options">
            <article className="pay-card">
              <h2>{selectedService.name}</h2>
              <p>{selectedService.description}</p>
              {priceLabel && <p className="pay-card__price">{priceLabel}</p>}
              {selectedService.id === "notary" && (
                <p className="pay-card__disclaimer">{notaryFeeDisclaimer}</p>
              )}
              {selectedService.stripePaymentLink ? (
                <a
                  className="btn btn--primary btn--block"
                  href={selectedService.stripePaymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pay Now
                </a>
              ) : (
                <div className="pay-card__fallback">
                  <p>
                    Online payment for this service is currently unavailable. Request
                    an invoice or contact us to proceed.
                  </p>
                  <div className="pay-card__fallback-actions">
                    <a className="btn btn--secondary btn--block" href={fallbackRequestLink}>
                      Request an Invoice
                    </a>
                    <a
                      className="btn btn--primary btn--block"
                      href={`tel:${siteConfig.phoneNumbers.secondary.tel}`}
                    >
                      Call/Text {siteConfig.phoneNumbers.secondary.display}
                    </a>
                  </div>
                  <p className="pay-card__fallback-contact">
                    Email{" "}
                    <a href={`mailto:${siteConfig.emails.admin}`}>
                      {siteConfig.emails.admin}
                    </a>
                  </p>
                </div>
              )}
            </article>
          </section>
        )}

        {selectedService && !selectedService.stripePaymentLink && invoiceFormId && (
          <section className="pay-invoice" id="invoice-form">
            <h2>Request an invoice</h2>
            <p>
              Share your service details and we will send a payment link or invoice
              promptly.
            </p>
            <HubSpotForm
              region="na2"
              portalId="242764935"
              formId={invoiceFormId}
              targetId="invoice-hubspot-form"
              prefill={{
                message: `Invoice request for: ${selectedService.name} (${selectedService.id})`,
              }}
            />
          </section>
        )}
      </main>
    </>
  );
}
