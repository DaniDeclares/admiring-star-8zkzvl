import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import {
  bookingServices,
  getBookingServiceById,
  pendingPaymentNotice,
} from "../data/bookingServices.js";
import "./PayPage.css";

export default function PayPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedServiceId = params.get("service");
  const selectedService = getBookingServiceById(selectedServiceId);
  const orderedServices = selectedService
    ? [
        selectedService,
        ...bookingServices.filter((service) => service.id !== selectedService.id),
      ]
    : bookingServices;

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
          <h1>Step 2: Pay to Confirm</h1>
          <p>{pendingPaymentNotice}</p>
          <p>
            Select your service below to complete payment. If you still need to
            book a time, start on the{" "}
            <Link to={selectedService ? `/book?service=${selectedService.id}` : "/book"}>
              booking page
            </Link>
            .
          </p>
        </header>

        <section className="pay-options">
          {orderedServices.map((service, index) => (
            <article key={service.id} className="pay-card">
              {index === 0 && selectedService && (
                <span className="pay-card__badge">Selected Service</span>
              )}
              <h2>{service.name}</h2>
              <p>{service.description}</p>
              <a
                className="btn btn--primary"
                href={service.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {service.payLabel}
              </a>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
