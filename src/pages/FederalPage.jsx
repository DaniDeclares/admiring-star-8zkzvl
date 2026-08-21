import React from 'react';
import { Helmet } from 'react-helmet-async';

const GovConLayout = () => {
  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', paddingBottom: '60px' }}>
      <Helmet><title>Government &amp; Institutional Procurement | Dani Declares LLC</title></Helmet>

      <div style={{ backgroundImage: 'linear-gradient(180deg, rgba(139,30,46,0.85), rgba(45,12,16,0.9)), url(/images/stock/court%20building%20exterior.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', margin: '0 0 12px 0', fontWeight: 'bold' }}>Government &amp; Institutional Procurement</h1>
        <p style={{ fontSize: '18px', maxWidth: '820px', margin: '0 auto 24px auto', lineHeight: '1.5', opacity: '0.95' }}>
          DANI DECLARES LLC is a Georgia-based mobile operations and support company positioned for federal, state, municipal, institutional, and prime-contractor teaming opportunities. Services are provided subject to solicitation-specific requirements, scope, and applicable procurement rules.
        </p>

        <div style={{ display: 'inline-flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px 24px', borderRadius: '6px', backdropFilter: 'blur(4px)', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span>UEI: <span style={{ color: '#D4AF37' }}>TD4TSG48LHN9</span></span>
          <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '20px' }}>CAGE CODE: <span style={{ color: '#D4AF37' }}>17VV2</span></span>
        </div>
      </div>

      <div style={{ padding: '50px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <h2 style={{ color: '#8B1E2E', margin: '0 0 20px 0', borderBottom: '2px solid #8B1E2E', paddingBottom: '10px' }}>Core Capabilities</h2>
          <p style={{ lineHeight: '1.6', fontSize: '16px', color: '#555', marginBottom: '24px' }}>
            We support buyers, prime contractors, municipal organizations, and institutional partners with mobile administrative, facilities, janitorial, document, and field-execution capabilities across Georgia and surrounding markets. Procurement eligibility and scope are determined by the applicable solicitation, contract vehicle, and buyer requirements.
          </p>

          <h3 style={{ fontSize: '18px', color: '#222', marginBottom: '12px' }}>Core NAICS Classifications</h3>
          <ul style={{ lineHeight: '2', paddingLeft: '20px', color: '#444' }}>
            <li><strong>561110</strong> &mdash; Office Administrative Services</li>
            <li><strong>561410</strong> &mdash; Document Preparation Services</li>
            <li><strong>561720</strong> &mdash; Janitorial Services</li>
            <li><strong>561210</strong> &mdash; Facilities Support Services</li>
            <li><strong>561790</strong> &mdash; Other Services to Buildings and Dwellings, where the specific scope fits</li>
            <li><strong>323113</strong> &mdash; Commercial Screen Printing</li>
          </ul>

          <p style={{ lineHeight: '1.6', fontSize: '14px', color: '#666', marginTop: '24px' }}>
            NAICS classifications describe the applicable industry activity; they do not by themselves establish contract eligibility, set-aside status, past performance, or an award/subcontract relationship.
          </p>

          <div style={{ textAlign: 'center', marginTop: '35px' }}>
            <a href="/request-service" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '14px 28px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>Request Procurement / Teaming Support &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovConLayout;
