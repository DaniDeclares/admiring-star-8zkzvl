import React from 'react';
import { Helmet } from 'react-helmet-async';

const GovConPage = () => {
  const establishedServices = [
    { code: 'NAICS 561110', name: 'Office Administrative Services' },
    { code: 'NAICS 561410', name: 'Document Preparation Services' }
  ];

  const expandedFieldServices = [
    { code: 'NAICS 561720', name: 'Janitorial Services (Residential, Commercial, Airbnb, & Office Cleaning)' },
    { code: 'NAICS 561790', name: 'Other Services to Buildings and Dwellings (Property Resets & Deep Cleans)' },
    { code: 'NAICS 561210', name: 'Facilities Support Services (Turnaround Management)' },
    { code: 'NAICS 323113', name: 'Commercial Screen Printing (Custom Apparel, Signage, & Merchandise Prep)' },
    { code: 'NAICS 492110', name: 'Couriers and Express Delivery Services (Mobile Routing)' }
  ];

  return (
    <div className='govcon-container' style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', color: '#333' }}>
      <Helmet><title>Government Contracting | Dani Declares LLC</title></Helmet>
      <div style={{ backgroundColor: '#f4f6f8', borderLeft: '6px solid #0056b3', padding: '24px', marginBottom: '40px', borderRadius: '4px' }}>
        <h1 style={{ margin: '0 0 16px 0', color: '#0056b3' }}>Dani Declares LLC</h1>
        <p style={{ margin: '6px 0', fontSize: '16px' }}><strong>Legal Entity Name:</strong> Dani Declares LLC</p>
        <p style={{ margin: '6px 0', fontSize: '16px' }}><strong>State of Incorporation:</strong> Georgia</p>
        <p style={{ margin: '6px 0', fontSize: '16px' }}><strong>Target Service Footprint:</strong> Georgia, South Carolina (Full Mobile Field Routing)</p>
        <p style={{ margin: '6px 0', fontSize: '16px' }}><strong>SAM.gov Status:</strong> Active / Validated ID</p>
        <p style={{ margin: '6px 0', fontSize: '16px', color: '#2b8a3e' }}><strong>UEI Number:</strong> TD4TSG48LHN9</p>
        <p style={{ margin: '6px 0', fontSize: '16px', color: '#2b8a3e' }}><strong>CAGE Code:</strong> 17VV2</p>
        <p style={{ margin: '6px 0', fontSize: '16px' }}><strong>Socioeconomic Status:</strong> Self-Certified Small Business (SB)</p>
      </div>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ borderBottom: '2px solid #ddd', paddingBottom: '8px', color: '#222' }}>Core Competencies</h2>
        <h3 style={{ color: '#555', marginTop: '24px' }}>Established Corporate Services</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '12px' }}>
          {establishedServices.map((srv) => ( <div key={srv.code} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff' }}><strong style={{ color: '#0056b3', display: 'block', marginBottom: '4px' }}>{srv.code}</strong><span>{srv.name}</span></div> ))}
        </div>
        <h3 style={{ color: '#555', marginTop: '32px' }}>Expanded Field & Facility Support</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '12px' }}>
          {expandedFieldServices.map((srv) => ( <div key={srv.code} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff' }}><strong style={{ color: '#2b8a3e', display: 'block', marginBottom: '4px' }}>{srv.code}</strong><span>{srv.name}</span></div> ))}
        </div>
      </div>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ borderBottom: '2px solid #ddd', paddingBottom: '8px', color: '#222' }}>Institutional Differentiators</h2>
        <ul style={{ lineHeight: '1.6', fontSize: '16px', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '10px' }}><strong>Full-Lifecycle Operations:</strong> Exceptional ability to manage a client's back-office documentation and compliance while deploying crews to execute physical site cleanouts and property resets simultaneously.</li>
          <li style={{ marginBottom: '10px' }}><strong>Multi-Sector cleaning Expertise:</strong> Proven capability running high-speed, detailed cleanings for residential apartments, corporate offices, and fast-turnaround short-term rentals (Airbnbs).</li>
          <li style={{ marginBottom: '10px' }}><strong>On-Demand Graphic & Print Readiness:</strong> In-house capability to rapidly process custom signage, labels, and apparel (Canva, heat-press, and print prep) for urgent event logistics and vendor deployments.</li>
          <li style={{ marginBottom: '10px' }}><strong>Two-State Mobile Footprint:</strong> Fully mobilized, asset-backed crews capable of rapid routing, scheduling, and physical deployment across the Georgia and South Carolina service footprint.</li>
        </ul>
      </div>
      <div style={{ padding: '24px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <h2 style={{ margin: '0 0 12px 0', color: '#333' }}>Teaming & Subcontracting Opportunities</h2>
        <p style={{ margin: '0 0 16px 0', fontSize: '16px', lineHeight: '1.5' }}>Dani Declares LLC is open to Joint Ventures (JV), Prime-Sub alliances, and corporate teaming arrangements to fulfill federal diversity quotas and service mandates.</p>
        <div style={{ marginBottom: '20px' }}>
          <a href='/assets/capability-statement.pdf' download='Dani_Declares_LLC_Capability_Statement.pdf' style={{ color: '#fff', backgroundColor: '#2b8a3e', padding: '12px 24px', textDecoration: 'none', borderRadius: '4px', display: 'inline-block', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>?? Download Capability Statement (PDF)</a>
        </div>
        <p style={{ margin: '0', fontSize: '16px' }}><strong>Procurement Contact Email:</strong> <a href='mailto:vendors@danideclares.com' style={{ color: '#0056b3', textDecoration: 'none', fontWeight: 'bold' }}>vendors@danideclares.com</a></p>
      </div>
    </div>
  );
};

export default GovConPage;