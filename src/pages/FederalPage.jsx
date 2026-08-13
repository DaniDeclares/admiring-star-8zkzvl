import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';

const primaryNaics = [
  ['561410', 'Document Preparation and Compliance Services'],
  ['561110', 'Office Administrative Support Services'],
  ['561720', 'Janitorial, Residential Turnovers & Airbnb Cleaning'],
  ['561790', 'Property Operations, Trash-Outs & Deep Reset Logistics'],
  ['561210', 'Facilities Operations and Management Support Services'],
  ['323113', 'Commercial Apparel Printing & Screen Merchandise Prep'],
];

const additionalNaics = [
  ['541611', 'Management Consulting Services'],
  ['541990', 'Professional, Scientific & Technical Services'],
  ['541199', 'All Other Legal Services'],
];

const FederalPage = () => {
  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', paddingBottom: '60px' }}>
      <Helmet>
        <title>Government Contracting &amp; Compliance | Dani Declares LLC</title>
        <meta
          name="description"
          content="Government contracting and subcontracting capabilities for administrative preparation, facility support, document logistics, cleaning, and SOP development."
        />
      </Helmet>

      <div
        style={{
          backgroundImage: 'linear-gradient(180deg, rgba(139,30,46,0.85), rgba(45,12,16,0.9)), url(/images/stock/court%20building%20exterior.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ color: '#D4AF37', fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Government Contracting &amp; Subcontracting
          </div>
          <h1 style={{ fontSize: '38px', margin: '0 0 12px 0', fontWeight: 'bold' }}>
            Government Procurement &amp; Compliance
          </h1>
          <p style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto 24px auto', lineHeight: '1.5', opacity: '0.95' }}>
            Dani Declares LLC provides administrative preparation, facility cleaning logistics, document logistics, SOP development, and mobile execution support for prime contractors, government entities, and institutional partners.
          </p>

          <div style={{ display: 'inline-flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px 24px', borderRadius: '6px', backdropFilter: 'blur(4px)', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span>UEI: <span style={{ color: '#D4AF37' }}>TD4TSG48LHN9</span></span>
            <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '20px' }}>CAGE CODE: <span style={{ color: '#D4AF37' }}>17VV2</span></span>
            <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '20px' }}>PRIMARY NAICS: <span style={{ color: '#D4AF37' }}>561410</span></span>
          </div>
        </div>
      </div>

      <div style={{ padding: '50px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <h2 style={{ color: '#8B1E2E', margin: '0 0 20px 0', borderBottom: '2px solid #8B1E2E', paddingBottom: '10px' }}>
            Core Capabilities
          </h2>
          <p style={{ lineHeight: '1.6', fontSize: '16px', color: '#555', marginBottom: '24px' }}>
            We support federal buyers, prime vendors, municipal offices, and institutional partners with mobile execution teams across Georgia and South Carolina. Core work includes administrative preparation, document logistics, facility support, cleaning and turnover operations, and SOP/workflow development.
          </p>

          <h3 style={{ fontSize: '18px', color: '#222', marginBottom: '12px' }}>Primary NAICS Classifications</h3>
          <ul style={{ lineHeight: '2', paddingLeft: '20px', color: '#444', marginBottom: '30px' }}>
            {primaryNaics.map(([code, label]) => (
              <li key={code}><strong>{code}</strong> &mdash; {label}</li>
            ))}
          </ul>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '25px' }}>
            <h3 style={{ fontSize: '18px', color: '#222', marginBottom: '12px' }}>Additional Classifications Represented in the GovCon Capability Set</h3>
            <ul style={{ lineHeight: '2', paddingLeft: '20px', color: '#444' }}>
              {additionalNaics.map(([code, label]) => (
                <li key={code}><strong>{code}</strong> &mdash; {label}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '35px', padding: '24px', backgroundColor: '#F8F5F1', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '18px', color: '#8B1E2E', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} /> Teaming &amp; Capability Requests
            </h3>
            <p style={{ lineHeight: '1.6', color: '#555', margin: 0 }}>
              Prime contractors and institutional procurement teams can use the standard intake channel to request capability information, teaming discussions, and scope-specific support.
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '35px' }}>
            <Link
              to="/request-service"
              style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '14px 28px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              Request Capability Statement &amp; Teaming <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FederalPage;
