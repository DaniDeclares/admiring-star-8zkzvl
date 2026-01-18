import React from "react";
import { siteConfig } from "../data/siteConfig.js";
import "./ServiceCta.css";

export default function ServiceCta({
  bookingLabel = "Book Appointment",
  bookingServiceId = "notary",
}) {
  const bookingUrl = `/book?service=${bookingServiceId}`;

  return (
    <section className="service-cta">
      <h2>Ready to book?</h2>
      <p>
        We make scheduling easy—book your appointment first, then pay to confirm
        your time.
      </p>
      <div className="service-cta__actions">
        <a className="btn btn--primary" href={bookingUrl}>
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
