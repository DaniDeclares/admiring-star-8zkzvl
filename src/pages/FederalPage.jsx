import React from 'react';
import { Helmet } from 'react-helmet-async';

const capabilityRows = [
  ['561720', 'Janitorial Services', 'Custodial execution, property resets, turnover and cleaning support'],
  ['561210', 'Facilities Support Services', 'Coordinated facility upkeep, work-order execution and vendor support'],
  ['561790', 'Other Services to Buildings and Dwellings', 'Use where solicitation scope matches property/facility-support work'],
  ['561410', 'Document Preparation Services', 'Administrative and document-preparation support'],
  ['561110', 'Office Administrative Services', 'Administrative execution and operational coordination'],
];

const GovConLayout = () => (
  <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', paddingBottom: '60px' }}>
    <Helmet>
      <title>Government & Institutional Procurement | DANI DECLARES LLC</title>
      <meta
        name="description"
        content="DANI DECLARES LLC government and institutional procurement capabilities for janitorial, facilities support, administrative execution and field logistics."
      />
    </Helmet>

    <section
      style={{
        background: 'linear-gradient(180deg, rgba(139,30,46,0.94), rgba(45,12,16,0.96))',
        color: '#fff',
        padding: '64px 20px',
        textAlign: 'center',
      }}
    >
      <p style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '13px', marginBottom: '12px' }}>
        Channel 04 · Government / Institutional Procurement
      </p>
      <h1 style={{ fontSize: '40px', margin: '0 0 14px', fontWeight: '700' }}>
        Facilities, Janitorial &amp; Execution Support
      </h1>
      <p style={{ fontSize: '18px', maxWidth: '820px', margin: '0 auto 28px', lineHeight: '1.6', opacity: 0.96 }}>
        DANI DECLARES LLC provides coordinated administrative, property, facilities and field-execution support for government entities, institutional buyers and prime contractors.
      </p>

      <div
        style={{
          display: 'inline-flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.12)',
          padding: '14px 24px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.22)',
          fontWeight: '700',
        }}
      >
        <span>UEI: <span style={{ color: '#D4AF37' }}>TD4TSG48LHN9</span></span>
        <span style={{ opacity: 0.55 }}>|</span>
        <span>CAGE: <span style={{ color: '#D4AF37' }}>17VV2</span></span>
      </div>
      <p style={{ maxWidth: '760px', margin: '18px auto 0', fontSize: '12px', opacity: 0.72 }}>
        Registration identifiers are presented from company records. Verify current SAM.gov status and all certification status before formal submission.
      </p>
    </section>

    <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '48px 20px' }}>
      <section style={{ background: '#fff', padding: '32px', borderRadius: '10px', boxShadow: '0 4px 18px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <h2 style={{ color: '#8B1E2E', marginTop: 0 }}>Core Capabilities</h2>
        <p style={{ lineHeight: 1.65, color: '#555' }}>
          Our initial procurement focus is federal, state, municipal, airport and institutional facility support, with an emphasis on janitorial execution, facilities support, property resets, administrative support and coordinated field logistics.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '24px' }}>
            <thead>
              <tr>
                {['NAICS', 'Classification', 'Application'].map((heading) => (
                  <th key={heading} style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #8B1E2E', color: '#222' }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {capabilityRows.map(([naics, name, application]) => (
                <tr key={naics}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: '700' }}>{naics}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{name}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee', color: '#555' }}>{application}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        {[
          ['Prime Teaming', 'Provide a defined work package to established primes that need dependable small-business field capacity.'],
          ['Task-Order Execution', 'Support formal scopes of work with documented work orders, completion evidence and escalation controls.'],
          ['Multi-Site Support', 'Coordinate recurring property and facility work across supportable Georgia and Southeast service areas.'],
        ].map(([title, text]) => (
          <article key={title} style={{ background: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' }}>
            <h3 style={{ marginTop: 0, color: '#222' }}>{title}</h3>
            <p style={{ lineHeight: 1.6, color: '#555', marginBottom: 0 }}>{text}</p>
          </article>
        ))}
      </section>

      <section style={{ background: '#2D0C10', color: '#fff', padding: '30px', borderRadius: '10px', marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0 }}>Procurement Integrity</h2>
        <p style={{ lineHeight: 1.65, opacity: 0.9 }}>
          DANI DECLARES does not represent a socioeconomic certification, contract award, past-performance record or federal-subcontractor status unless the underlying government or company record supports the claim. Certification and solicitation eligibility are evaluated separately for each opportunity.
        </p>
      </section>

      <div style={{ textAlign: 'center' }}>
        <a href="/request-service" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '14px 28px', textDecoration: 'none', borderRadius: '5px', fontWeight: '700', display: 'inline-block', marginRight: '10px' }}>
          Start Procurement Intake →
        </a>
        <a href="/Capability_Statement_Dani_Declares.txt" style={{ color: '#8B1E2E', padding: '14px 20px', textDecoration: 'none', fontWeight: '700', display: 'inline-block' }}>
          View Capability Statement
        </a>
      </div>
    </main>
  </div>
);

export default GovConLayout;
