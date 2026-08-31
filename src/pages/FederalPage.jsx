import React from 'react';
import { Helmet } from 'react-helmet-async';

const GovConLayout = () => {
  const card = { backgroundColor: '#fff', padding: '28px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' };
  const section = { padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' };
  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', paddingBottom: '60px' }}>
      <Helmet><title>Government &amp; Institutional Procurement | DANI DECLARES LLC</title></Helmet>

      <div style={{ backgroundImage: 'linear-gradient(180deg, rgba(139,30,46,0.85), rgba(45,12,16,0.9)), url(/images/stock/court%20building%20exterior.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', margin: '0 0 12px 0', fontWeight: 'bold' }}>Government &amp; Institutional Procurement</h1>
        <p style={{ fontSize: '18px', maxWidth: '820px', margin: '0 auto 24px auto', lineHeight: '1.5', opacity: '0.95' }}>
          DANI DECLARES LLC provides execution-focused janitorial, facility-reset, field-documentation, and operational support for public-sector and institutional procurement. Engagements are handled through solicitation-specific scopes, quotations, task orders, teaming arrangements, and subcontracting structures.
        </p>
        <div style={{ display: 'inline-flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px 24px', borderRadius: '6px', backdropFilter: 'blur(4px)', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span>UEI: <span style={{ color: '#D4AF37' }}>TD4TSG48LHN9</span></span>
          <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '20px' }}>CAGE CODE: <span style={{ color: '#D4AF37' }}>17VV2</span></span>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Primary Government Lane</h2>
          <h3>561720 — Janitorial Services</h3>
          <p><strong>PSC S201 — Custodial/Janitorial</strong></p>
          <p style={{ lineHeight: '1.6', color: '#555' }}>Recurring custodial cleaning, restroom and common-area service, trash/recycling support, deep cleaning, facility resets, and other solicitation-defined janitorial requirements.</p>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Strategic Adjacent Lane</h2>
          <h3>561210 — Facilities Support Services</h3>
          <p style={{ lineHeight: '1.6', color: '#555' }}>Scope-dependent work-order coordination, scheduling, site support, facility documentation, completion verification, and related operational support.</p>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Government Contract Families</h2>
          <ul style={{ lineHeight: '1.9', paddingLeft: '20px', color: '#444' }}>
            <li>Custodial / Janitorial</li>
            <li>Facility Turnover / Reset</li>
            <li>Facilities Support</li>
            <li>Field Documentation</li>
            <li>Administrative / Document Support</li>
            <li>Supplies / Logistics</li>
            <li>Printing / Signage</li>
            <li>Event / Community Support</li>
            <li>Courier / Delivery</li>
            <li>Notary services when specifically procured and currently authorized</li>
          </ul>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Procurement Growth Path</h2>
          <p style={{ lineHeight: '1.8', fontWeight: 'bold' }}>Commercial capability → local/state/institutional work → subcontracting/teaming → documented government past performance → larger state/federal opportunities → multi-location facility contracts</p>
          <p style={{ lineHeight: '1.6', color: '#666', fontSize: '14px' }}>Market-scale examples are reference signals only. They are not DANI DECLARES awards, revenue, or past performance.</p>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Certification &amp; Eligibility Notice</h2>
          <p style={{ lineHeight: '1.6', color: '#555' }}>DANI DECLARES must not be represented as WOSB or EDWOSB certified unless and until SBA certification is approved and reflected in the applicable SBA systems. A certification application, target socioeconomic status, and approved certification are separate statuses.</p>
          <p style={{ lineHeight: '1.6', color: '#555' }}>A listed NAICS or PSC does not by itself establish eligibility, certification, licensing, past performance, staffing capacity, or award history. Requirements are validated against the actual solicitation and applicable registrations.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <a href="/request-service" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '14px 28px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>Request Procurement / Teaming Support &rarr;</a>
      </div>
    </div>
  );
};

export default GovConLayout;
