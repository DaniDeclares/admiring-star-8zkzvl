import React, { useEffect, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { STRIPE_LINKS } from "../config/stripeLinks.js";
import { getPriceLabel } from "../data/pricingCanon.js";
import { getServiceById } from "../data/services.js";
import { siteConfig } from "../data/siteConfig.js";
import "./PayPage.css";

export default function PayPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedServiceId = params.get("service");
  const selectedService = useMemo(
    () => getServiceById(selectedServiceId),
    [selectedServiceId]
  );
  const invoiceRef = useRef(null);
  const stripeLink = selectedServiceId ? STRIPE_LINKS[selectedServiceId] : "";
  const showInvoiceFallback = Boolean(selectedService && !stripeLink);
  const priceLabel = selectedService?.priceLabel
    || (selectedServiceId ? getPriceLabel(selectedServiceId) : null);
  const hasValidService = Boolean(selectedService);

  const handleInvoiceScroll = () => {
    invoiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!showInvoiceFallback) {
      return;
    }

    const targetId = "hs-invoice-form";
    const ensureForm = () => {
      if (!window.hbspt || !document.getElementById(targetId)) {
        return;
      }

      if (document.querySelector(`#${targetId} .hs-form`)) {
        return;
      }

      window.hbspt.forms.create({
        portalId: "242764935",
        formId: "cd04ab8c-3203-43e8-b634-7e2a1daefd36",
        region: "na2",
        target: `#${targetId}`,
        onFormReady: () => {
          const container = document.getElementById(targetId);
          if (!container) return;
          const serviceField = container.querySelector(
            'input[name="serviceKey"]'
          );
          if (serviceField && selectedServiceId) {
            serviceField.value = selectedServiceId;
          }
          const pageField = container.querySelector('input[name="pageUrl"]');
          if (pageField) {
            pageField.value = window.location.href;
          }
        },
      });
    };

    const scriptId = "hs-form-embed-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      ensureForm();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "//js-na2.hsforms.net/forms/embed/v2.js";
    script.async = true;
    script.charset = "utf-8";
    script.onload = ensureForm;
    document.body.appendChild(script);
  }, [selectedServiceId, showInvoiceFallback]);

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
                <p>{selectedService.shortDesc}</p>
                {priceLabel && <p className="pay-card__price">{priceLabel}</p>}
                {stripeLink && (
                  <p className="pay-card__stripe-note">
                    Secure payment powered by Stripe.
                  </p>
                )}
                {stripeLink && (
                  <a
                    className="btn btn--primary btn--block"
                    href={stripeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Pay Now
                  </a>
                )}
                {showInvoiceFallback && (
                  <div className="pay-card__fallback">
                    <p>
                      Online payment for this service is currently unavailable.
                      Request an invoice or contact us to proceed.
                    </p>
                    <div className="pay-card__fallback-actions">
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={handleInvoiceScroll}
                      >
                        Request an Invoice
                      </button>
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
                      <Link className="btn btn--tertiary" to="/services">
                        Back to Services
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </article>
        </section>

        {showInvoiceFallback && (
          <section id="invoice" className="pay-invoice" ref={invoiceRef}>
            <h3>Request an Invoice</h3>
            <p>
              Tell us what you need and we’ll send the correct invoice or payment
              link.
            </p>
            <div className="hsFormWrap embed-wrap">
              <div id="hs-invoice-form" />
            </div>
          </section>
        )}
      </main>
    </>
  );
}
