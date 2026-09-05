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
          DANI DECLARES LLC provides execution-focused janitorial, facility-reset, field-documentation, and operational support for public-sector and institutional procurement. We distinguish ordinary commercial cleaning from contract performance: government work is pursued through defined procurement scopes, solicitations, quotations, task orders, teaming arrangements, and subcontracting structures.
        </p>
        <p style={{ fontSize: '15px', maxWidth: '760px', margin: '0 auto 24px auto', lineHeight: '1.5', opacity: '0.9' }}>
          Procurement pathways may include federal, state, county, municipal, public authority, education, healthcare, and other institutional buyers, subject to the requirements of each opportunity.
        </p>
        <div style={{ display: 'inline-flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px 24px', borderRadius: '6px', backdropFilter: 'blur(4px)', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span>UEI: <span style={{ color: '#D4AF37' }}>TD4TSG48LHN9</span></span>
          <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '20px' }}>CAGE: <span style={{ color: '#D4AF37' }}>Pending SAM verification</span></span>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Primary Government Contracting Lane</h2>
          <h3>Strategic target: 561720 — Janitorial Services</h3>
          <p><strong>Strategic target: PSC S201 — Custodial/Janitorial</strong></p>
          <p style={{ lineHeight: '1.6', color: '#555' }}>Recurring custodial cleaning, restroom and common-area service, trash/recycling support, deep cleaning, facility resets, and other solicitation-defined janitorial requirements.</p>
          <p style={{ lineHeight: '1.6', color: '#666', fontSize: '14px' }}>These are DANI DECLARES' primary procurement targets, not a representation that these classifications are currently the primary NAICS/PSC values in SAM.gov. Current federal registration fields remain subject to authoritative SAM reconciliation.</p>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Strategic Adjacent Contracting Lane</h2>
          <h3>561210 — Facilities Support Services</h3>
          <p style={{ lineHeight: '1.6', color: '#555' }}>Scope-dependent work-order coordination, scheduling, site support, facility documentation, completion verification, and related operational support.</p>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Public-Sector Contract Families</h2>
          <ul style={{ lineHeight: '1.9', paddingLeft: '20px', color: '#444' }}>
            <li>Custodial / Janitorial Contracts</li>
            <li>Facility Turnover / Reset</li>
            <li>Facilities Support</li>
            <li>Field Documentation &amp; Completion Verification</li>
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
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Who We Can Contract With</h2>
          <ul style={{ lineHeight: '1.9', paddingLeft: '20px', color: '#444' }}>
            <li>Federal agencies and federal prime contractors</li>
            <li>State agencies and statewide procurement programs</li>
            <li>County and municipal governments</li>
            <li>Public authorities and quasi-governmental entities</li>
            <li>Public schools, colleges, universities, and other education institutions</li>
            <li>Healthcare and other institutional buyers</li>
            <li>Prime contractors seeking qualified small-business subcontractors or teaming partners</li>
          </ul>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Contracting vs. Routine Cleaning</h2>
          <p style={{ lineHeight: '1.6', color: '#555' }}>Cleaning is a service capability. Government contracting is the procurement and performance framework through which that capability is sold to public-sector buyers. A government engagement may therefore involve recurring cleaning, a one-time facility reset, a defined work order, an RFQ response, a subcontract, a task order, or a broader facilities-support scope.</p>
          <p style={{ lineHeight: '1.6', color: '#555' }}>Each pursuit is evaluated against the actual solicitation, scope of work, location, schedule, insurance, licensing, staffing, equipment, socioeconomic eligibility, and other stated requirements.</p>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Procurement Growth Path</h2>
          <p style={{ lineHeight: '1.8', fontWeight: 'bold' }}>Commercial capability → local/institutional contracts → state/county/municipal work → federal subcontracting/teaming → documented government performance → larger prime opportunities → multi-location facility contracts</p>
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
