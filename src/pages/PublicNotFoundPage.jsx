import React from 'react';
import { Link } from 'react-router-dom';
import './PublicNotFoundPage.css';

// An unknown public path is not a successful homepage visit.
// Preserve the normal site shell and offer the four established entry points.
export default function PublicNotFoundPage() {
  return (
    <section className="dd-route-recovery" aria-labelledby="dd-route-recovery-heading">
      <div className="dd-route-recovery__inner">
        <p className="dd-route-recovery__eyebrow">DANI DECLARES · LET'S GET YOU THERE</p>
        <h1 id="dd-route-recovery-heading">This page isn't available.</h1>
        <p className="dd-route-recovery__lead">
          The link may have changed. You can still explore our services,
          describe the work you need handled, or find your next step.
        </p>
        <div className="dd-route-recovery__actions" aria-label="Where to go next">
          <Link className="dd-route-recovery__primary" to="/request-service">Tell us what you need</Link>
          <Link className="dd-route-recovery__secondary" to="/catalog">Explore services</Link>
        </div>
        <div className="dd-route-recovery__more">
          <Link to="/packages">Browse packages</Link>
          <Link to="/connect">Connect &amp; Join</Link>
          <Link to="/">Return home</Link>
        </div>
      </div>
    </section>
  );
}
