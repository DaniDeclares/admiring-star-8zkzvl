import React from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig.js";
import { getBookingServiceById } from "../data/bookingServices.js";
import "./ServiceCta.css";

export default function ServiceCta({
  serviceId = "notary",
  bookingLabel = "Book Appointment",
  link,
}) {
  const service = getBookingServiceById(serviceId);
  const bookingUrl = link || `/book?service=${service?.id || "notary"}`;

  return (
    <section className="service-cta">
      <h2>Ready to book?</h2>
      <p>We make scheduling easy—choose your appointment time and we will come to you.</p>
      <div className="service-cta__actions">
        <Link className="btn btn--primary" to={bookingUrl}>
          {bookingLabel}
        </Link>
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
