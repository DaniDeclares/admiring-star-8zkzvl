import React from 'react';
import { Helmet } from 'react-helmet-async';
export default function TermsPage() {
  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <Helmet><title>Terms of Service | Dani Declares LLC</title></Helmet>
      <h1 style={{ color: '#8B1E2E' }}>Terms of Service</h1>
      <p><strong>Effective Date: July 2026</strong></p>
      <p>By using the website, client intake portals, or dispatch networks of Dani Declares LLC, you agree to the following operational parameters:</p>
      <h2>1. Service Dispatches &amp; Cancellations</h2>
      <p>Assignments, property turnovers, courier routing requests, and print orders are scheduled upon confirmation. Urgent, after-hours, or rush requests may be subject to expedited processing surcharges as outlined by our dispatch text matrices.</p>
      <h2>2. Corporate Limitations</h2>
      <p>Dani Declares LLC acts as an independent execution provider. We assume no legal liability for underlying lease agreements, court filings contents, or document compliance specifications. Dani Declares LLC is explicitly not a law firm and does not provide legal counsel.</p>
    </div>
  );
}