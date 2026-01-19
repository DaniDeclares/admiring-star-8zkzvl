import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
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
  const [formReady, setFormReady] = useState(false);
  const stripeLink = selectedService?.stripePaymentLink;
  const showInvoiceFallback = !stripeLink;
  const portalId = process.env.REACT_APP_HUBSPOT_PORTAL_ID;
  const formId = process.env.REACT_APP_HUBSPOT_INVOICE_FORM_ID;
  const showInvoiceForm = Boolean(showInvoiceFallback && portalId && formId);

  useEffect(() => {
    if (!showInvoiceFallback) {
      return;
    }

    if (!portalId || !formId) {
      console.warn(
        "HubSpot invoice form env vars are missing. Skipping form embed."
      );
      return;
    }

    if (!document.getElementById("hs-forms-script")) {
      const script = document.createElement("script");
      script.id = "hs-forms-script";
      script.src = "https://js.hsforms.net/forms/v2.js";
      script.async = true;
      script.defer = true;
      script.onload = () => setFormReady(true);
      document.body.appendChild(script);
    } else {
      setFormReady(true);
    }
  }, [formId, portalId, showInvoiceFallback]);

  useEffect(() => {
    if (!showInvoiceForm || !formReady || !window.hbspt?.forms) {
      return;
    }

    const target = document.getElementById("hs-invoice-form");
    if (!target || target.childElementCount > 0) {
      return;
    }

    window.hbspt.forms.create({
      portalId,
      formId,
      target: "#hs-invoice-form",
    });
  }, [formId, formReady, portalId, showInvoiceForm]);

  const handleInvoiceScroll = () => {
    invoiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

        <section className="pay-details">
          <article className="pay-card">
            <h2>{selectedService?.name || "Service Not Found"}</h2>
            <p>
              {selectedService?.shortDesc ||
                "We could not locate the selected service. Please request an invoice or browse the services list."}
            </p>
            {selectedService?.priceDisplay && (
              <p className="pay-card__price">{selectedService.priceDisplay}</p>
            )}
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
                  Online payment for this service is currently unavailable. Request
                  an invoice and we’ll send a secure payment link.
                </p>
                <div className="pay-card__fallback-actions">
                  {showInvoiceForm && (
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={handleInvoiceScroll}
                    >
                      Request an Invoice
                    </button>
                  )}
                  <a
                    className="btn btn--secondary"
                    href={`tel:${siteConfig.phoneNumbers.secondary.tel}`}
                  >
                    Call/Text {siteConfig.phoneNumbers.secondary.display}
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
          </article>
        </section>

        {showInvoiceForm && (
          <section className="pay-invoice" ref={invoiceRef}>
            <h3>Request an Invoice</h3>
            <p>
              Share your service details below and we will send a secure invoice
              link.
            </p>
            <div id="hs-invoice-form" className="pay-invoice__form"></div>
          </section>
        )}
      </main>
    </>
  );
}
