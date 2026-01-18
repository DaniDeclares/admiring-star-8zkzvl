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

  return (
    <>
      <Helmet>
        <title>Complete Payment • Dani Declares</title>
        <meta
          name="description"
          content="Complete payment for your booked Dani Declares service."
        />
      </Helmet>

      <main className="pay-page">
        <header className="pay-hero">
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
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
