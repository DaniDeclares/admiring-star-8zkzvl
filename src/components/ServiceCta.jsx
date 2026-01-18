import React from "react";
import { siteConfig } from "../data/siteConfig.js";
import { bookingPolicyText } from "../data/serviceRoutes.js";
import "./ServiceCta.css";

export default function ServiceCta({
  bookingLabel = "Book Appointment",
  bookingServiceId = "notary",
}) {
  return (
    <section className="service-cta">
      <h2>Ready to book?</h2>
      <p>
        Schedule your appointment in minutes and we will confirm the details by
        text.
      </p>
      <div className="service-cta__actions">
        <a className="btn btn--primary" href={`/book?service=${bookingServiceId}`}>
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
          <p className="service-cta__policy">{bookingPolicyText}</p>
        </div>
      </div>
    </section>
  );
}
