import React from "react";
import { Link } from "react-router-dom";
import "./TravelFeesBlock.css";

export default function TravelFeesBlock() {
  return (
    <section className="travel-fees">
      <h2>Service Area & Scope</h2>
      <p>
        We no longer use a mileage or per-mile customer pricing formula.
        Geographic treatment is determined by the current market, service
        area, channel, and reconciled service record.
      </p>
      <Link to="/travel-quote" className="btn btn--secondary">
        Request a service-area review
      </Link>
    </section>
  );
}
