import React from 'react';
import { Helmet } from 'react-helmet-async';
export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <Helmet><title>Privacy Policy | Dani Declares LLC</title></Helmet>
      <h1 style={{ color: '#8B1E2E' }}>Privacy Policy</h1>
      <p><strong>Effective Date: July 2026</strong></p>
      <p>Dani Declares LLC operates as a mobile single-source operations firm across Georgia and South Carolina. We are committed to protecting the data, property photos, and document history uploaded to our client portals.</p>
      <h2>1. Information We Collect</h2>
      <p>We collect customer details via our request forms, mobile phone lines, and file upload systems, including names, company parameters, property addresses, and completion photography portfolios.</p>
      <h2>2. Data Security &amp; Retention</h2>
      <p>All client credentials, past invoices, and document signature tracking logs are securely encrypted and stored within our private database frameworks. We do not sell or lease your commercial property data to third-party networks.</p>
      <p><em>Disclaimer: Dani Declares LLC is not a law firm and does not provide legal advice. Notary and signature verifications are performed strictly within legally commissioned boundaries.</em></p>
    </div>
  );
}