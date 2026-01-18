import React from "react";
import { siteConfig } from "../data/siteConfig.js";
import { buildTidyCalUrl, tidyCalEvents } from "../data/tidycal.js";
import "./ServiceCta.css";

export default function ServiceCta({
  bookingSlug = tidyCalEvents.generalNotary.slug,
  bookingLabel = "Book Appointment",
}) {
  const bookingUrl = buildTidyCalUrl(bookingSlug);

  return (
    <section className="service-cta">
      <h2>Ready to book?</h2>
      <p>We make scheduling easy—choose your appointment time and we will come to you.</p>
      <div className="service-cta__actions">
        <a
          className="btn btn--primary"
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {bookingLabel}
        </a>
        <div className="service-cta__contact">
          <p>
            <strong>Call/Text:</strong>{" "}
            <a href={`tel:${siteConfig.phoneNumbers.secondary.tel}`}>
              {siteConfig.phoneNumbers.secondary.display}
            </a>
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${siteConfig.emails.admin}`}>
              {siteConfig.emails.admin}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
