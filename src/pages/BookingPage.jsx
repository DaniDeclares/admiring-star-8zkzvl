import React, { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import TidyCalEmbed from "../components/TidyCalEmbed.jsx";
import {
  bookingServices,
  bookingPolicyText,
  getServiceById,
} from "../data/serviceRoutes.js";
import "./BookingPage.css";

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get("service");

  const selectedService = useMemo(() => {
    const match = getServiceById(requestedService);
    return bookingServices.find((service) => service.id === match?.id) ||
      bookingServices[0];
  }, [requestedService]);

  useEffect(() => {
    if (!selectedService) {
      return;
    }

    const target = document.getElementById(`booking-${selectedService.id}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedService]);

  if (!selectedService) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Book an Appointment • Dani Declares</title>
        <meta
          name="description"
          content="Book a notary appointment, apostille intake, officiant service, or loan signing."
        />
      </Helmet>

      <main className="booking-page">
        <header className="booking-hero">
          <h1>Book an Appointment</h1>
          <p>
            Select your service and choose a time. {bookingPolicyText}
          </p>
        </header>

        <section className="booking-options">
          {bookingServices.map((service) => (
            <article key={service.id} className="booking-card">
              <h2>{service.title}</h2>
              <p>{service.shortDesc}</p>
              <p className="booking-policy">{bookingPolicyText}</p>
              <div className="booking-card__actions">
                <Link
                  className="btn btn--primary"
                  to={`/book?service=${service.id}`}
                >
                  Select {service.title}
                </Link>
                <a
                  className="btn btn--accent"
                  href={`#booking-${service.id}`}
                >
                  Jump to Booking
                </a>
              </div>
            </article>
          ))}
        </section>

        <section className="booking-embeds">
          {bookingServices.map((service) => (
            <div key={service.id} id={`booking-${service.id}`} className="booking-embed">
              <div className="booking-embed__header">
                <h3>{service.title}</h3>
                <p>{service.shortDesc}</p>
              </div>
              <TidyCalEmbed path={service.bookingEmbedPath} />
              <p className="booking-policy">{bookingPolicyText}</p>
            </div>
          ))}
        </section>

        <section className="payment-step">
          <h2>Step 2: Pay to Confirm</h2>
          <p>{bookingPolicyText}</p>
          <Link
            className="btn btn--secondary"
            to={`/pay?service=${selectedService.id}`}
          >
            Pay to Confirm {selectedService.title}
          </Link>
        </section>
      </main>
    </>
  );
}
