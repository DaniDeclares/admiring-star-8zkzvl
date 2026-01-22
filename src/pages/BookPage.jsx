import React, { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import TidyCalEmbed from "../components/TidyCalEmbed.jsx";
import { bookingServices } from "../data/services.js";
import { siteConfig } from "../data/siteConfig.js";
import { buildTidyCalPath } from "../data/tidycal.js";
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

  useEffect(() => {
    if (!selectedService) {
      return;
    }

    const target = document.getElementById(`booking-${selectedService.id}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedService]);

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
            Your appointment is pending until payment is completed. Unpaid bookings
            may be released.
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
                href={`/book?service=${service.id}#booking-${service.id}`}
              >
                {service.title}
              </a>
            ))}
          </div>
        </section>

        <section className="booking-embeds">
          {bookingServices.map((service) => (
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
              <TidyCalEmbed path={buildTidyCalPath(service.tidycalSlug)} />
              <div className="booking-card__actions">
                {service.paymentServiceId ? (
                  <a
                    className="btn btn--secondary"
                    href={`/pay?service=${service.paymentServiceId}`}
                  >
                    Pay to Confirm
                  </a>
                ) : (
                  <a
                    className="btn btn--secondary"
                    style={{ opacity: 0.6 }}
                    href={`tel:${siteConfig.phoneNumbers.primary.tel}`}
                  >
                    Payment link unavailable — call/text to pay
                  </a>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
