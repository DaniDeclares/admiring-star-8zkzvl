import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const FieldServicesPage = () => {
  const handlesItems = [
    { title: "Property Reset Planning", text: "Comprehensive scope of work creation configured with a property management mindset." },
    { title: "Turnover & Rental Support", text: "Fast move-in, move-out, long-term rental, and short-term Airbnb guest transitions." },
    { title: "Deep & Specialist Cleaning", text: "Detailed structural cleanouts, post-construction cleanup, and thorough detail adjustments." },
    { title: "Inspection Readiness & Tracking", text: "Rigorous before-and-after photo documentation, condition notes, and formal completion reports." },
    { title: "Trash-Out & Vendor Support", text: "Coordinating debris removal, gate access coordination, and physical vendor supervision." },
    { title: "Recurring Property Support", text: "Scheduled repeat routing built specifically for property managers, landlords, and investors." }
  ];

  const coreServices = [
    { title: "Move-In / Move-Out Cleaning", desc: "Full cleaning for properties transitioning between tenants, buyers, or owners. We leave it ready for the next occupant." },
    { title: "Deep Cleaning", desc: "Top to bottom detail cleaning including appliances, cabinets, baseboards, bathrooms, and buildup removal." },
    { title: "Rental Turnovers", desc: "Fast, reliable turnover service for landlords and property managers. We get your unit back on the market quickly." },
    { title: "Airbnb & Short-Term Rental Resets", desc: "Between-guest resets, restocking coordination, and full turnovers for short-term rental properties." },
    { title: "Post-Construction Cleaning", desc: "Debris removal, dust cleanup, surface cleaning, and final detail work after construction or renovation." },
    { title: "Inspections & Photo Documentation", desc: "Property condition reports and photo documentation for move-out records, listings, or landlord files." }
  ];

  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', paddingBottom: '60px' }}>
      <Helmet><title>Property Operations &amp; Reset Services | Dani Declares LLC</title></Helmet>
      
      {/* Header Banner */}
      <div style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', margin: '0 0 12px 0' }}>Dani Declares On-Site Field Logistics</h1>
        <p style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto 24px auto', lineHeight: '1.5', opacity: '0.9' }}>Property Operations &amp; Reset Services. We prepare properties for the next tenant, guest, buyer, or inspection with clean scopes and photo completion reports.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', fontWeight: 'bold' }}>
          <span style={{ backgroundColor: '#rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '4px' }}>Move-Ready</span>
          <span style={{ backgroundColor: '#rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '4px' }}>Guest-Ready</span>
          <span style={{ backgroundColor: '#rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '4px' }}>Inspection-Ready</span>
          <span style={{ backgroundColor: '#rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '4px' }}>Market-Ready</span>
        </div>
      </div>

      {/* Intro section */}
      <div style={{ padding: '50px 20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h2>On-Site Field Logistics Is More Than Cleaning</h2>
        <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.6', marginTop: '16px' }}>
          Built for property managers, landlords, investors, real estate professionals, and Airbnb hosts who need properties handled from assessment to completion with organized field execution and documentation.
        </p>
      </div>

      {/* Handles Section */}
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h3 style={{ color: '#8B1E2E', fontSize: '24px', textAlign: 'center', marginBottom: '32px' }}>What On-Site Field Logistics Handles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {handlesItems.map((item) => (
            <div key={item.title} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h4 style={{ color: '#8B1E2E', margin: '0 0 8px 0', fontSize: '18px' }}>{item.title}</h4>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', margin: '0' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Services Section */}
      <div style={{ padding: '50px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h3 style={{ color: '#222', fontSize: '26px', textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid #ddd', paddingBottom: '12px' }}>Core Services</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {coreServices.map((service) => (
            <div key={service.title} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '6px', borderLeft: '4px solid #D4AF37' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>{service.title}</h4>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', margin: '0' }}>{service.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button Block */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link to="/request-service" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '14px 32px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '16px', display: 'inline-block' }}>Request an On-Site Field Logistics Quote</Link>
      </div>
    </div>
  );
};

export default FieldServicesPage;