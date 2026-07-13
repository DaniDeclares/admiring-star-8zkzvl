import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
  const lanes = [
    { title: 'On-Site Field Logistics', text: 'Rapid move-in/move-out deep cleaning, multi-family unit turnover resets, post-construction debris cleanup, and detailed before/after photo documentation tracking reports.', path: '/request-service', img: '/images/stock/property-cleaning-turnover.jpg' },
    { title: 'Custom Print & Merchandise', text: 'Premium custom heat-press t-shirts, promotional corporate apparel, retail product packaging labels, custom stickers, and branded enterprise merchandise kits.', path: '/request-service', img: '/images/stock/Clipboards.jpg' },
    { title: 'Apostille & Legal Compliance', text: 'Secure international apostille processing, mobile non-attorney document preparation, multi-page document packages, printing, scanning, and secure administrative filing.', path: '/request-service', img: '/images/stock/legal paperwork desk.jpg' },
    { title: 'Trusts, POAs & Loan Signings', text: 'Mobilized on-site signature coordination for living trusts, real estate loan signings, durable powers of attorney, and complex legal estate packages.', path: '/request-service', img: '/images/stock/mobile notary public.jpg' },
    { title: 'Mobile Courier Services', text: 'Secure regional court filing deliveries, time-sensitive case record retrieval, urgent jail/hospital signature runs, and municipal office routing support.', path: '/request-service', img: '/images/stock/court%20building%20exterior.jpg' },
    { title: 'Government Contracting Portal', text: 'Verified federal subcontractor operations equipped for agency assignments. Active identifiers: UEI (TD4TSG48LHN9) and CAGE Code (17VV2).', path: '/govcon', img: '/images/stock/file cabinet.jpg' }
  ];

  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', paddingTop: '70px', minHeight: '100vh' }}>
      <Helmet><title>Mobile Operations &amp; Corporate Execution Support | Dani Declares LLC</title></Helmet>
      
      {/* The High-Velocity Conversion Hero */}
      <div style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '90px 20px', textAlign: 'center', borderBottom: '6px solid #D4AF37' }}>
        <span style={{ backgroundColor: '#D4AF37', color: '#222', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' }}>? Urgent Mobile Fleet Deployed &amp; Active</span>
        <h1 style={{ fontSize: '46px', fontWeight: 'bold', margin: '0 0 16px 0', lineHeight: '1.2' }}>One Company. Total Execution.</h1>
        <p style={{ fontSize: '20px', margin: '0 auto 36px auto', maxWidth: '800px', lineHeight: '1.6', opacity: '0.95' }}>We come directly to your location and handle the process from start to submission. Serving apartment complexes, law firms, local brands, and families across Metro Atlanta and South Carolina.</p>
        
        {/* The 3 Absolute Booking Funnels - Positioned Instantly For Fast Conversions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto' }}>
          <Link to='/request-service' style={{ backgroundColor: '#D4AF37', color: '#222', padding: '16px 32px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '16px', flexGrow: '1', minWidth: '260px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', border: '2px solid #D4AF37' }}>?? Book Turnovers &amp; Field Logistics</Link>
          <Link to='/request-service' style={{ backgroundColor: '#fff', color: '#8B1E2E', padding: '16px 32px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '16px', flexGrow: '1', minWidth: '260px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', border: '2px solid #fff' }}>?? Order T-Shirts &amp; Print Material</Link>
          <Link to='/request-service' style={{ backgroundColor: '#222', color: '#fff', padding: '16px 32px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '16px', flexGrow: '1', minWidth: '260px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', border: '2px solid rgba(255,255,255,0.2)' }}>?? Book Notary, Trusts &amp; Apostille</Link>
        </div>
        
        <div style={{ marginTop: '28px', fontSize: '16px', fontWeight: 'bold' }}>
          ?? Call / Text Direct Handler: <a href='tel:4706829348' style={{ color: '#fff', textDecoration: 'underline' }}>(470) 682-9348</a>
        </div>
      </div>

      {/* Trust Credential Anchor Bar */}
      <div style={{ backgroundColor: '#fff', padding: '20px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', fontWeight: 'bold', fontSize: '15px', color: '#555', borderBottom: '1px solid #eee' }}>
        ?? Trusted By: Multi-Family Communities • Independent Law Firms • Title Agencies • Local Startups • Logistics Carriers
      </div>

      {/* Structured Competency Matrix Grid */}
      <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '34px', color: '#8B1E2E', marginBottom: '8px', fontWeight: 'bold' }}>Select Your Operation Lane</h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '16px', marginBottom: '45px' }}>Click any dedicated category box below to instantly route your project specifications directly to our localized deployment coordinators.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
          {lanes.map((lane) => (
            <Link to={lane.path} key={lane.title} style={{ textDecoration: 'none', color: 'inherit', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #8B1E2E', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}>
              <div style={{ height: '210px', backgroundColor: '#eee' }}><img src={lane.img} alt={lane.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e)=>{e.target.src='/images/stock/file cabinet.jpg';}} /></div>
              <div style={{ padding: '24px', flexGrow: '1', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '20px', color: '#222', margin: '0 0 10px 0', fontWeight: 'bold' }}>{lane.title}</h3>
                <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px', flexGrow: '1' }}>{lane.text}</p>
                <span style={{ color: '#8B1E2E', fontWeight: 'bold', fontSize: '14px', display: 'inline-block' }}>Launch Service Request &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;