import React from 'react';
import { Helmet } from 'react-helmet-async';

const GovConLayout = () => {
  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', paddingBottom: '60px' }}>
      <Helmet><title>Government Procurement &amp; Compliance Portal | Dani Declares LLC</title></Helmet>
      
      {/* Premium Courthouse Hero Banner */}
      <div style={{ backgroundImage: 'linear-gradient(180deg, rgba(139,30,46,0.85), rgba(45,12,16,0.9)), url(/images/stock/court%20building%20exterior.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', margin: '0 0 12px 0', fontWeight: 'bold' }}>Government Contracting Portal</h1>
        <p style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto 24px auto', lineHeight: '1.5', opacity: '0.95' }}>Dani Declares LLC is a verified, fully registered federal subcontractor providing mobile administrative compliance, on-site field cleaning logistics, and secure courier routing.</p>
        
        {/* Core Identifiers */}
        <div style={{ display: 'inline-flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px 24px', borderRadius: '6px', backdropFilter: 'blur(4px)', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span>UEI: <span style={{ color: '#D4AF37' }}>TD4TSG48LHN9</span></span>
          <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '20px' }}>CAGE CODE: <span style={{ color: '#D4AF37' }}>17VV2</span></span>
        </div>
      </div>

      {/* Capabilities Block */}
      <div style={{ padding: '50px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <h2 style={{ color: '#8B1E2E', margin: '0 0 20px 0', borderBottom: '2px solid #8B1E2E', paddingBottom: '10px' }}>Core Capabilities Summary</h2>
          <p style={{ lineHeight: '1.6', fontSize: '16px', color: '#555', marginBottom: '24px' }}>
            We serve federal buyers, prime vendors, municipal offices, and institutional tracking agencies by deploying mobile execution teams across Georgia and South Carolina. Our operations are fully structured under NAICS standards to satisfy small business capacity set-asides cleanly.
          </p>
          
          <h3 style={{ fontSize: '18px', color: '#222', marginBottom: '12px' }}>Primary NAICS Classifications Locked:</h3>
          <ul style={{ lineHeight: '2', paddingLeft: '20px', color: '#444' }}>
            <li><strong>561110</strong> &mdash; Office Administrative Support Services</li>
            <li><strong>561410</strong> &mdash; Document Preparation and Compliance Services</li>
            <li><strong>561720</strong> &mdash; Janitorial, Residential Turnovers &amp; Airbnb Cleaning</li>
            <li><strong>561790</strong> &mdash; Property Operations, Trash-Outs &amp; Deep Reset Logistics</li>
            <li><strong>561210</strong> &mdash; Facilities Operations and Management Support Services</li>
            <li><strong>323113</strong> &mdash; Commercial Apparel Printing &amp; Screen Merchandise Prep</li>
          </ul>

          <div style={{ textAlign: 'center', marginTop: '35px' }}>
            <a href="/request-service" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '14px 28px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>Access Secure Prime Teaming Portal &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovConLayout;