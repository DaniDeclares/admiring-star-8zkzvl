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
        <p style={{ fontSize: '18px', maxWidth: '840px', margin: '0 auto 24px auto', lineHeight: '1.5', opacity: '0.95' }}>
          DANI DECLARES LLC provides execution-focused facility, field, administrative, logistics, supply and production support for public-sector and institutional procurement. We translate defined scopes into coordinated execution, documentation, delivery and closeout.
        </p>
        <p style={{ fontSize: '15px', maxWidth: '800px', margin: '0 auto 24px auto', lineHeight: '1.5', opacity: '0.9' }}>
          Procurement pathways may include federal, state, county, municipal, public authority, education, healthcare, and other institutional buyers through prime, subcontract, teaming and other solicitation-defined structures.
        </p>
        <div style={{ display: 'inline-flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px 24px', borderRadius: '6px', backdropFilter: 'blur(4px)', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span>UEI: <span style={{ color: '#D4AF37' }}>TD4TSG48LHN9</span></span>
          <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '20px' }}>CAGE: <span style={{ color: '#D4AF37' }}>Pending SAM verification</span></span>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Current Government Acquisition Territory</h2>
          <p style={{ lineHeight: '1.7', color: '#555' }}><strong>Atlanta, Georgia → Northeast Georgia corridor → Greenville, South Carolina</strong>, with <strong>Spartanburg, South Carolina as the hard maximum</strong>.</p>
          <ul style={{ lineHeight: '1.9', paddingLeft: '20px', color: '#444' }}>
            <li><strong>Core:</strong> Atlanta metro and immediate surrounding operating area.</li>
            <li><strong>Corridor:</strong> qualifying Northeast Georgia / Upstate South Carolina opportunities along the Atlanta-to-Greenville operating path.</li>
            <li><strong>Maximum:</strong> Spartanburg, SC — selective only based on operational economics.</li>
            <li><strong>Site-qualified:</strong> statewide or multi-location opportunities are screened location-by-location; only qualifying sites enter active pursuit.</li>
            <li><strong>Outside:</strong> materially beyond the approved territory is not an active DANI acquisition target.</li>
          </ul>
          <p style={{ lineHeight: '1.6', color: '#666', fontSize: '14px' }}>This is the GovCon acquisition boundary. It is separate from commercial service-area language and does not imply that every location in Georgia or South Carolina is an active government pursuit market.</p>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Primary Government Contracting Lane</h2>
          <h3>Strategic target: 561720 — Janitorial Services</h3>
          <p><strong>Strategic target: PSC S201 — Custodial/Janitorial</strong></p>
          <p style={{ lineHeight: '1.6', color: '#555' }}>Recurring custodial cleaning, restroom/common-area service, trash/recycling support, deep cleaning, facility resets, turnover/readiness, and other solicitation-defined janitorial requirements.</p>
          <p style={{ lineHeight: '1.6', color: '#666', fontSize: '14px' }}>These are strategic procurement targets, not a representation that they are the current primary NAICS/PSC values in SAM.gov. Current federal registration fields remain subject to authoritative SAM reconciliation.</p>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Strategic Adjacent Contracting Lane</h2>
          <h3>561210 — Facilities Support Services</h3>
          <p style={{ lineHeight: '1.6', color: '#555' }}>Scope-dependent work-order coordination, scheduling, site support, facility inspections, documentation, completion verification and related operational support.</p>
          <p style={{ lineHeight: '1.6', color: '#666', fontSize: '14px' }}>DANI treats facilities support selectively: the controlling solicitation determines the required technical scope, staffing, equipment, insurance, experience and other qualifications.</p>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Public-Sector Contract Families</h2>
          <ul style={{ lineHeight: '1.9', paddingLeft: '20px', color: '#444' }}>
            <li><strong>Custodial &amp; Facility Care:</strong> recurring cleaning, deep cleaning, turnover, readiness and post-construction cleaning</li>
            <li><strong>Facilities &amp; Site Operations:</strong> work-order support, inspections, scheduling, condition documentation and completion verification</li>
            <li><strong>Exterior Facilities:</strong> pressure washing, exterior cleaning, gutters/downspouts, debris removal and exterior windows when specifically qualified</li>
            <li><strong>Emergency Sanitation:</strong> emergency cleaning/sanitizing and incident response when technical and insurance requirements are met; specialized remediation may be handled through qualified partners</li>
            <li><strong>Supplies &amp; Distribution:</strong> facility/custodial supplies, consumables, equipment sourcing, packaging, distribution and delivery</li>
            <li><strong>Printing &amp; Signage:</strong> forms, manuals, signs, banners, labels, print-on-demand and print distribution through verified production capacity or qualified partners</li>
            <li><strong>Logistics &amp; Field Services:</strong> courier, delivery, pickup/dropoff, supply distribution and field-support logistics</li>
            <li><strong>Administrative &amp; Documentation:</strong> records, scheduling, task tracking, contract documentation, scanning, document preparation and closeout support</li>
            <li><strong>Public Events &amp; Community Support:</strong> setup, breakdown, cleanup, signage, supplies and logistics when specifically procured</li>
            <li><strong>Notary:</strong> only when specifically procured and currently authorized</li>
          </ul>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>How DANI Positions for Awards</h2>
          <p style={{ lineHeight: '1.6', color: '#555' }}>DANI DECLARES does not present every capability as an unconditional promise. We lead with verified credentials and established capabilities, then match the offer to the actual procurement requirement.</p>
          <ol style={{ lineHeight: '1.9', paddingLeft: '20px', color: '#444' }}>
            <li>Identify the buyer, facility and procurement method.</li>
            <li>Verify the controlling solicitation, addenda and requirements.</li>
            <li>Separate verified credentials from strategic targets and capability gaps.</li>
            <li>Choose the correct path: PRIME, SUB, TEAM, VENDOR/SUPPLIER, or NO-BID.</li>
            <li>Build the proposal around scope, staffing, equipment, insurance, price, schedule, evidence and compliance.</li>
            <li>Execute with documented work orders, field evidence, QA, reporting, invoicing and closeout.</li>
          </ol>
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
          <p style={{ lineHeight: '1.6', color: '#555' }}>Cleaning is one service capability. Government contracting is the procurement and performance framework through which DANI sells defined capabilities to public-sector buyers. A government engagement may therefore involve recurring cleaning, a facility reset, an exterior-services scope, a supply requirement, a defined work order, an RFQ response, a subcontract, a task order, or a broader facilities-support scope.</p>
          <p style={{ lineHeight: '1.6', color: '#555' }}>Each pursuit is evaluated against the actual solicitation, location, schedule, insurance, licensing, staffing, equipment, socioeconomic eligibility, past-performance requirements and other stated conditions.</p>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Procurement Growth Path</h2>
          <p style={{ lineHeight: '1.8', fontWeight: 'bold' }}>Core facility capability → local/institutional contracts → state/county/municipal work → adjacent facility/supply/logistics contracts → federal subcontracting/teaming → documented performance → larger prime opportunities → multi-location facility contracts</p>
          <p style={{ lineHeight: '1.6', color: '#666', fontSize: '14px' }}>Market-scale examples are reference signals only. They are not DANI DECLARES awards, revenue, or past performance.</p>
        </div>
      </div>

      <div style={section}>
        <div style={card}>
          <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Certification &amp; Eligibility Notice</h2>
          <p style={{ lineHeight: '1.6', color: '#555' }}>DANI DECLARES must not be represented as WOSB or EDWOSB certified unless and until SBA certification is approved and reflected in the applicable SBA systems. A certification application, target socioeconomic status, and approved certification are separate statuses.</p>
          <p style={{ lineHeight: '1.6', color: '#555' }}>A listed NAICS or PSC does not by itself establish eligibility, certification, licensing, past performance, staffing capacity, equipment, insurance or award history. Requirements are validated against the actual solicitation and applicable registrations.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <a href="/request-service" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '14px 28px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>Request Procurement / Teaming Support &rarr;</a>
      </div>
    </div>
  );
};

export default GovConLayout;
