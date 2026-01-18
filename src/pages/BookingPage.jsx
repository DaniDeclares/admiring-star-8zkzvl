import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import TidyCalEmbed from "../components/TidyCalEmbed.jsx";
import {
  availabilityPolicy,
  bookingServices,
  calendarPolicy,
  getBookingServiceById,
  pendingPaymentNotice,
} from "../data/bookingServices.js";
import "./BookingPage.css";

export default function BookingPage() {
  const location = useLocation();
  const embedRef = useRef(null);
  const defaultServiceId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const serviceId = params.get("service");
    return getBookingServiceById(serviceId)?.id || bookingServices[0]?.id;
  }, [location.search]);

  const [activeServiceId, setActiveServiceId] = useState(defaultServiceId);

  useEffect(() => {
    setActiveServiceId(defaultServiceId);
  }, [defaultServiceId]);

  const activeService =
    getBookingServiceById(activeServiceId) || bookingServices[0];

  const handleSelectService = (serviceId) => {
    setActiveServiceId(serviceId);
    setTimeout(() => {
      embedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

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
          <h1>Book a Service</h1>
          <p>
            Select a service to book your appointment, then complete payment to
            confirm your time.
          </p>
          <p className="booking-hero__notice">{pendingPaymentNotice}</p>
        </header>

        <section className="booking-options">
          {bookingServices.map((service) => (
            <article key={service.id} className="booking-card">
              <h2>{service.name}</h2>
              <p>{service.description}</p>
              <p className="booking-card__notice">{pendingPaymentNotice}</p>
              <div className="booking-card__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => handleSelectService(service.id)}
                >
                  Book Now
                </button>
                <Link className="btn btn--secondary" to={`/pay?service=${service.id}`}>
                  Pay to Confirm
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="booking-details" ref={embedRef}>
          <div className="booking-details__header">
            <h2>Step 1: Book {activeService?.name}</h2>
            <p>{pendingPaymentNotice}</p>
            <p className="booking-details__policy">{availabilityPolicy}</p>
            <p className="booking-details__policy">{calendarPolicy}</p>
          </div>
          <div className="booking-embed">
            <TidyCalEmbed path={activeService?.tidyCalPath} />
          </div>
          <div className="booking-confirmation">
            <h3>Step 2: Pay to Confirm</h3>
            <p>
              Complete payment right after booking to lock in your appointment.
              You can also head straight to the payment page now.
            </p>
            <Link
              className="btn btn--primary"
              to={`/pay?service=${activeService?.id}`}
            >
              Pay to Confirm {activeService?.name}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
