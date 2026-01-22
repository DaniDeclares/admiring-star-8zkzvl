import React from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig.js";
codex/redesign-danideclares.com-for-service-booking
import "./ServiceCta.css";

export default function ServiceCta({
  bookingLabel = "Book Appointment",
  bookingServiceId = "notary",
}) {
  const bookingUrl = `/book?service=${bookingServiceId}`;
=======
import { getServiceById } from "../data/services.js";
import "./ServiceCta.css";

export default function ServiceCta({
  serviceId = "notary",
  bookingLabel = "Book Appointment",
  link,
}) {
  const service = getServiceById(serviceId);
  const bookingUrl = link || `/book?service=${service?.id || "notary"}`;


  return (
    <section className="service-cta">
      <h2>Ready to book?</h2>
      <p>
        We make scheduling easy—book your appointment first, then pay to confirm
        your time.
      </p>
      <div className="service-cta__actions">
codex/redesign-danideclares.com-for-service-booking
        <a className="btn btn--primary" href={bookingUrl}>
=======
        <Link className="btn btn--primary" to={bookingUrl}>

          {bookingLabel}
        </Link>
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
