import React, { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import TidyCalEmbed from "../components/TidyCalEmbed.jsx";
import { getServiceById, serviceCatalog } from "../data/services.js";
import "./BookingPage.css";

export default function BookingPage() {
  const location = useLocation();
  const sectionRefs = useRef({});
  const params = new URLSearchParams(location.search);
  const selectedServiceId = params.get("service");
  const selectedService =
    getServiceById(selectedServiceId) || serviceCatalog[0];

  useEffect(() => {
    if (!selectedService?.id) {
      return;
    }
    const section = sectionRefs.current[selectedService.id];
    if (!section) {
      return;
    }
    const timer = setTimeout(() => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedService?.id]);

  return (
    <>
      <Helmet>
        <title>Book a Service • Dani Declares</title>
        <meta
          name="description"
          content="Book a mobile notary, apostille, officiant, or loan signing appointment with immediate payment to confirm."
        />
      </Helmet>

      <main className="booking-page">
        <header className="booking-hero">
          <p className="booking-eyebrow">Step 1</p>
          <h1>Book Your Appointment</h1>
          <p>
            Choose the service you need, select a time, and complete payment to
            confirm your appointment.
          </p>
          <p className="booking-hero__notice">
            Your appointment is pending until payment is completed. Unpaid bookings
            may be released.
          </p>
        </header>

        <section className="booking-options">
          {serviceCatalog.map((service) => (
            <article key={service.id} className="booking-card">
              <h2>{service.title}</h2>
              <p>{service.shortDesc}</p>
              <p className="booking-card__notice">
                Your appointment is pending until payment is completed. Unpaid bookings
                may be released.
              </p>
              <div className="booking-card__actions">
                <Link
                  className="btn btn--primary"
                  to={`/book?service=${service.id}`}
                >
                  {service.actionLabels.book}
                </Link>
                <Link className="btn btn--secondary" to={`/pay?service=${service.id}`}>
                  {service.actionLabels.pay}
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="booking-details">
          {serviceCatalog.map((service) => (
            <div
              key={service.id}
              className={`booking-embed-section ${
                selectedService?.id === service.id ? "is-active" : ""
              }`}
              ref={(node) => {
                sectionRefs.current[service.id] = node;
              }}
            >
              <div className="booking-details__header">
                <p className="booking-section__eyebrow">Book {service.title}</p>
                <h2>{service.title} Booking</h2>
                <p className="booking-details__policy">
                  Your appointment is pending until payment is completed. Unpaid bookings
                  may be released.
                </p>
              </div>
              <div className="booking-embed">
                <TidyCalEmbed path={service.tidycalSlug} />
              </div>
              <div className="booking-confirmation">
                <h3>Step 2: Pay to Confirm</h3>
                <p>
                  Complete payment right after booking to secure your appointment. If
                  you need to pay first, you can do that now.
                </p>
                <Link
                  className="btn btn--primary"
                  to={`/pay?service=${service.id}`}
                >
                  {service.actionLabels.pay}
                </Link>
              </div>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
