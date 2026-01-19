import React, { useEffect, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import TidyCalEmbed from "../components/TidyCalEmbed.jsx";
import {
  bookingServices,
  getBookingServiceById,
} from "../data/bookingServices.js";
import { notaryFeeDisclaimer } from "../data/services.js";
import "./BookingPage.css";

export default function BookingPage() {
  const location = useLocation();
  const sectionRef = useRef(null);
  const params = new URLSearchParams(location.search);
  const selectedServiceId = params.get("service");
  const selectedService = useMemo(
    () => getBookingServiceById(selectedServiceId),
    [selectedServiceId]
  );
  const hasSelection = Boolean(selectedService);

  useEffect(() => {
    if (!sectionRef.current || !hasSelection) {
      return;
    }
    const timer = setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, [hasSelection, selectedService?.id]);

  return (
    <>
      <Helmet>
        <title>Book a Service • Dani Declares</title>
        <meta
          name="description"
          content="Book a mobile notary, apostille, or loan signing appointment with immediate payment to confirm."
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

        <section className="booking-requirements">
          <div>
            <h2>Booking Requirements</h2>
            <ul>
              <li>All services book against the same calendar to prevent double-booking.</li>
              <li>Please complete payment immediately after booking to confirm.</li>
              <li>If you do not see times, call/text and we will assist.</li>
            </ul>
          </div>
          <div className="booking-requirements__note">
            <p>{notaryFeeDisclaimer}</p>
            <p>
              Preferred client rates, volume pricing, multi-appointment bundles, and
              retainers are available for law firms, tax professionals, and recurring
              clients. After-hours and urgent requests may include an expedited
              service fee.
            </p>
          </div>
        </section>

        <section className="booking-options">
          {bookingServices.map((service) => (
            <article key={service.id} className="booking-card">
              <h2>{service.name}</h2>
              <p>{service.shortDesc}</p>
              <p className="booking-card__notice">
                Appointment is pending until payment is completed. Unpaid bookings
                may be released.
              </p>
              <div className="booking-card__actions">
                <Link
                  className="btn btn--primary"
                  to={`/book?service=${service.id}`}
                >
                  Book Now
                </Link>
                <Link className="btn btn--secondary" to={`/pay?service=${service.id}`}>
                  Pay to Confirm
                </Link>
              </div>
            </article>
          ))}
        </section>

        {hasSelection && (
          <section className="booking-details" ref={sectionRef}>
            <div className="booking-embed-section is-active">
              <div className="booking-details__header">
                <p className="booking-section__eyebrow">
                  Book {selectedService.name}
                </p>
                <h2>{selectedService.name} Booking</h2>
                <p className="booking-details__policy">
                  Appointment is pending until payment is completed. Unpaid bookings
                  may be released. Deposits are applied to your total. Travel/after-hours
                  adjustments are disclosed before service. If you need to reschedule,
                  contact us ASAP.
                </p>
              </div>
              <div className="booking-embed">
                <TidyCalEmbed path={selectedService.tidycalSlug} />
              </div>
              <div className="booking-confirmation">
                <h3>Step 2: Pay to Confirm</h3>
                <p>
                  Complete payment right after booking to secure your appointment. Unpaid
                  bookings are released.
                </p>
                <Link
                  className="btn btn--primary"
                  to={`/pay?service=${selectedService.id}`}
                >
                  Pay to Confirm
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
