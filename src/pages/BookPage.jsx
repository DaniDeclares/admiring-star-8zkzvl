import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import TidyCalEmbed from "../components/TidyCalEmbed.jsx";
import { bookingServices } from "../data/services.js";
import { siteConfig } from "../data/siteConfig.js";
import { buildTidyCalPath, buildTidyCalUrl } from "../data/tidycal.js";
import "./BookPage.css";

const getSelectedService = (serviceId) =>
  bookingServices.find((service) => service.id === serviceId);

export default function BookPage() {
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("service");
  const selectedService = useMemo(
    () => getSelectedService(selectedId),
    [selectedId]
  );

  return (
    <>
      <Helmet>
        <title>Book Your Service • Dani Declares</title>
        <meta
          name="description"
          content="Book your notary, apostille, officiant, or loan signing appointment in just a few clicks."
        />
      </Helmet>

      <main className="book-page">
        <header className="book-hero">
          <p className="eyebrow">Service Booking</p>
          <h1>Book Your Appointment</h1>
          <p>
            Payment required to confirm. Your appointment is pending until payment
            is completed, and unpaid bookings may be released.
          </p>
        </header>

        <section className="book-service-selector">
          <h2>Select a service</h2>
          <div className="service-chip-grid">
            {bookingServices.map((service) => (
              <a
                key={service.id}
                className={`service-chip ${
                  selectedService?.id === service.id ? "active" : ""
                }`}
                href={`/book?service=${service.id}`}
              >
                {service.title}
              </a>
            ))}
          </div>
        </section>

        <section className="booking-embeds">
          {bookingServices.map((service) => {
            const tidycalPath = buildTidyCalPath(service.tidycalSlug);
            const tidycalUrl = buildTidyCalUrl(service.tidycalSlug);

            return (
            <article
              key={service.id}
              id={`booking-${service.id}`}
              className="booking-card"
            >
              <div className="booking-card__header">
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.shortDescription}</p>
                </div>
                {service.priceLabel && (
                  <span className="price-pill">{service.priceLabel}</span>
                )}
              </div>
              <div className="booking-card__primary">
                <a
                  className="btn btn--primary btn--block"
                  href={tidycalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book Appointment
                </a>
              </div>
              <div className="booking-card__embed">
                <TidyCalEmbed path={tidycalPath} />
                <div className="booking-card__fallback">
                  <p>
                    If the calendar does not load or shows as unavailable, use the
                    direct link below.
                  </p>
                  <a
                    className="btn btn--secondary btn--block"
                    href={tidycalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open TidyCal Scheduling
                  </a>
                </div>
              </div>
              <div className="booking-card__payment">
                <h4>Payment required to confirm</h4>
                <p>
                  Complete payment right after booking to secure your appointment.
                </p>
                {service.paymentServiceId ? (
                  <a
                    className="btn btn--secondary btn--block"
                    href={`/pay?service=${service.id}`}
                  >
                    Pay to Confirm
                  </a>
                ) : (
                  <a
                    className="btn btn--secondary btn--block"
                    style={{ opacity: 0.6 }}
                    href={`tel:${siteConfig.phoneNumbers.primary.tel}`}
                  >
                    Payment link unavailable — call/text to pay
                  </a>
                )}
              </div>
            </article>
            );
          })}
        </section>
      </main>
    </>
  );
}
