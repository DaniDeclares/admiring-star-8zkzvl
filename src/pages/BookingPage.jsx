import React from "react";
import { Helmet } from "react-helmet-async";
import TidyCalEmbed from "../components/TidyCalEmbed.jsx";
import {
  buildTidyCalPath,
  buildTidyCalUrl,
  tidyCalEvents,
} from "../data/tidycal.js";
import "./BookingPage.css";

const bookingOptions = [
  tidyCalEvents.generalNotary,
  tidyCalEvents.loanSigning,
  tidyCalEvents.apostille,
  tidyCalEvents.officiantConsultation,
];

export default function BookingPage() {
  return (
    <>
      <Helmet>
        <title>Book an Appointment • Dani Declares</title>
        <meta
          name="description"
          content="Book a notary appointment, loan signing, apostille intake, or officiant consultation with Dani Declares."
        />
      </Helmet>

      <main className="booking-page">
        <header className="booking-hero">
          <h1>Book an Appointment</h1>
          <p>
            Choose the service that fits your needs and reserve a time that works
            for you.
          </p>
        </header>

        <section className="booking-options">
          {bookingOptions.map((option) => (
            <article key={option.slug} className="booking-card">
              <h2>{option.label}</h2>
              <p>
                Select an available time for your {option.label.toLowerCase()}.
              </p>
              <div className="booking-card__actions">
                <a
                  className="btn btn--primary"
                  href={`#booking-${option.slug}`}
                >
                  Book Now
                </a>
                <a
                  className="btn btn--secondary"
                  href={buildTidyCalUrl(option.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in new tab
                </a>
              </div>
            </article>
          ))}
        </section>

        <section className="booking-embeds">
          {bookingOptions.map((option) => (
            <div key={option.slug} id={`booking-${option.slug}`} className="booking-embed">
              <h3>{option.label}</h3>
              <TidyCalEmbed path={buildTidyCalPath(option.slug)} />
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
