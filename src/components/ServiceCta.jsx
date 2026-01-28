import React from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig.js";
import { getServiceById } from "../data/services.js";
import "./ServiceCta.css";

export default function ServiceCta({
  serviceId = "notary",
  bookingLabel = "Book an Appointment",
  link,
}) {
  const service = getServiceById(serviceId);
  const bookingUrl = link || `/book?service=${service?.id || "notary"}`;
  return (
    <section className="service-cta">
      <h2>Ready to book?</h2>
      <p>
        We make scheduling easy—book your appointment first, then complete payment
        to confirm your time.
      </p>
      <div className="service-cta__actions">
        <Link className="btn btn--primary" to={bookingUrl}>
          {bookingLabel}
        </Link>
        <p className="service-cta__note">
          Appointments are not confirmed until payment is completed.
        </p>
        <div className="service-cta__contact">
          <p>
            <strong>Call/Text:</strong>{" "}
            <a href={`tel:${siteConfig.phoneNumbers.primary.tel}`}>
              {siteConfig.phoneNumbers.primary.display}
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
