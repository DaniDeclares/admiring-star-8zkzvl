import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import {
  serviceRoutes,
  bookingPolicyText,
  getServiceById,
} from "../data/serviceRoutes.js";
import "./PayPage.css";

export default function PayPage() {
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get("service");

  const selectedService = useMemo(() => {
    return getServiceById(requestedService) || serviceRoutes[0];
  }, [requestedService]);

  if (!selectedService) {
    return null;
  }

  return (
    <main className="pay-page">
      <Helmet>
        <title>Pay to Confirm • Dani Declares</title>
        <meta
          name="description"
          content="Submit payment to confirm your Dani Declares appointment."
        />
      </Helmet>

      <section className="pay-hero">
        <h1>Pay to Confirm</h1>
        <p>{bookingPolicyText}</p>
        <div className="pay-hero__card">
          <h2>{selectedService.title}</h2>
          <p>{selectedService.shortDesc}</p>
          {selectedService.stripePaymentLink ? (
            <a
              className="btn btn--secondary"
              href={selectedService.stripePaymentLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Secure Payment Link
            </a>
          ) : (
            <div className="pay-missing">
              <p>
                Payment link coming soon. Please contact us to complete payment
                for this service.
              </p>
              <Link to="/contact" className="btn btn--primary">
                Contact Us
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="pay-options">
        <h2>Select another service</h2>
        <div className="pay-grid">
          {serviceRoutes.map((service) => (
            <Link
              key={service.id}
              to={`/pay?service=${service.id}`}
              className={`pay-card ${
                service.id === selectedService.id ? "active" : ""
              }`}
            >
              <h3>{service.title}</h3>
              <p>{service.shortDesc}</p>
              <span className="pay-card__cta">Pay to Confirm</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
