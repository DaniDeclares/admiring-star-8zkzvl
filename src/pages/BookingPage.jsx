import React, { useEffect, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import {
  bookingServices,
  getBookingServiceById,
} from "../data/bookingServices.js";
import { getPriceLabel } from "../data/pricingCanon.js";
import NotaryFeesNotice from "../components/NotaryFeesNotice.jsx";
import { loadTidycalScript } from "../lib/loadTidycal.js";
import "./BookingPage.css";

const SERVICE_ID_ALIASES = {
  loan_signing: "loansigning",
  officiant_deposit: "officiant",
};

export default function BookingPage() {
  const location = useLocation();
  const sectionRef = useRef(null);
  const params = new URLSearchParams(location.search);
  const rawServiceId = params.get("service") || "notary";
  const resolvedServiceId = SERVICE_ID_ALIASES[rawServiceId] || rawServiceId;
  const selectedServiceId = getBookingServiceById(resolvedServiceId)
    ? resolvedServiceId
    : "notary";
  const selectedService = useMemo(
    () => getBookingServiceById(selectedServiceId),
    [selectedServiceId]
  );
  const hasSelection = Boolean(selectedService);
  const tidycalPath = selectedService?.tidyCalPath || "danideclaresns/notary";
  const tidycalLink = `https://tidycal.com/${tidycalPath}`;
  const priceLabel = selectedServiceId ? getPriceLabel(selectedServiceId) : null;

  useEffect(() => {
    loadTidycalScript();
  }, []);

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
              <li>All services book against the same calendar and availability rules.</li>
              <li>This keeps availability synchronized to prevent double-booking.</li>
              <li>Please complete payment immediately after booking to confirm.</li>
              <li>If you do not see times, call/text and we will assist.</li>
            </ul>
          </div>
          <div className="booking-requirements__note">
            <NotaryFeesNotice />
          </div>
        </section>

        <section className="booking-policy">
          <h2>Deposit &amp; Cancellation Policy</h2>
          <ul>
            <li>
              Appointment is pending until payment is completed. Unpaid bookings are
              released.
            </li>
            <li>
              Deposits are non-refundable and applied to your total at the appointment.
            </li>
            <li>
              Travel/after-hours adjustments are disclosed before service begins.
            </li>
            <li>If you need to reschedule, contact us ASAP.</li>
          </ul>
        </section>

        <section className="booking-options booking-cards">
          {bookingServices.map((service) => (
            <article key={service.id} className="booking-card">
              <h2>{service.name}</h2>
              <p>{service.description}</p>
              <p className="booking-card__notice">
                Appointment is pending until payment is completed. Unpaid bookings
                are released.
              </p>
              <div className="booking-card__actions">
                <Link
                  className="btn btn--primary"
                  to={`/book?service=${service.id}`}
                >
                  Book Now
                </Link>
                <Link
                  className="btn btn--secondary"
                  to={`/pay?service=${service.payServiceKey || service.id}`}
                >
                  {service.payLabel || "Pay to Confirm"}
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
                  Appointment is pending until payment is completed. Unpaid bookings are
                  released. Deposits are non-refundable and applied to your total.
                  Travel/after-hours adjustments are disclosed before service. If you
                  need to reschedule, contact us ASAP.
                </p>
                {priceLabel && (
                  <p className="booking-details__price">{priceLabel}</p>
                )}
              </div>
              <div className="booking-embed">
                <div className="embed-wrap">
                  <div className="tidycal-embed" data-path={tidycalPath} />
                </div>
                <div className="booking-embed__fallback">
                  <p>
                    If the calendar does not load or shows as disabled, use the
                    direct link below to schedule your appointment.
                  </p>
                  <a
                    className="btn btn--secondary"
                    href={tidycalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open TidyCal Scheduling
                  </a>
                </div>
              </div>
              <div className="booking-confirmation">
                <h3>Already booked? Continue to payment</h3>
                <p>
                  Complete payment right after booking to secure your appointment. Unpaid
                  bookings are released.
                </p>
                <Link
                  className="btn btn--primary"
                  to={`/pay?service=${selectedService.payServiceKey || selectedServiceId}`}
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
