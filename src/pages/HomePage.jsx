import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
  const lanes = [
    { title: 'Administrative & Document Management', text: 'Professional notary, apostille, non-attorney document preparation, I-9 verification, printing, and scanning support.', path: '/request-service', img: '/images/stock/legal paperwork desk.jpg' },
    { title: 'On-Site Field Logistics', text: 'Move-in and move-out cleaning, deep cleaning, residential transitions, rental turnovers, and full property resets.', path: '/field-services', img: '/images/stock/mobile notary public.jpg' },
    { title: 'Mobile Courier Services', text: 'Secure court filings, urgent document delivery routing, municipal agency visits, and carrier back-office transport management.', path: '/request-service', img: '/images/stock/court building exterior.jpg' },
    { title: 'Event Planning & On-Site Setup', text: 'Comprehensive vendor coordination, operations scheduling, physical asset placement, event breakdown, and execution support.', path: '/events', img: '/images/festival/festival-promo-gradient.jpg' },
    { title: 'Government & Compliance Support', text: 'Court filings, regulatory office runs, document compliance tracking, and structured teaming portals for federal contracts.', path: '/govcon', img: '/images/stock/file cabinet.jpg' },
    { title: 'Custom Print & Merchandise Prep', text: 'Production labels, packaging stickers, heat-press custom apparel, client welcome kits, and branded enterprise merchandise.', path: '/request-service', img: '/images/products/renamed_merch_image.jpg' }
  ];
  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333' }}>
      <Helmet><title>Mobile Operations & Execution Support | Dani Declares LLC</title></Helmet>
      <div style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Mobile Operations &amp; Execution Support</h1>
        <p style={{ fontSize: '19px', margin: '0 auto 32px auto', maxWidth: '800px', lineHeight: '1.6', opacity: '0.95' }}>We handle it from start to finish. Back-office administrative compliance, regional field couriers, and complete on-site property turn cleaning logistics across Georgia and South Carolina.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to='/request-service' style={{ backgroundColor: '#D4AF37', color: '#222', padding: '14px 28px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '16px' }}>Request Service Now</Link>
          <a href='tel:4704857173' style={{ border: '2px solid #fff', color: '#fff', padding: '12px 26px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '16px' }}>Call / Text Now</a>
        </div>
      </div>
      <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', color: '#8B1E2E', marginBottom: '12px' }}>Choose Your Service Lane</h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '16px', marginBottom: '40px' }}>Select an operation lane below to route your request straight down to our deployment teams.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
          {lanes.map((lane) => (
            <div key={lane.title} style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '220px', backgroundColor: '#eee' }}><img src={lane.img} alt={lane.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e)=>{e.target.src='/images/festival/festival-promo-gradient.jpg';}} /></div>
              <div style={{ padding: '24px', flexGrow: '1', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '20px', color: '#222', margin: '0 0 12px 0', fontWeight: 'bold' }}>{lane.title}</h3>
                <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.5', marginBottom: '20px', flexGrow: '1' }}>{lane.text}</p>
                <Link to={lane.path} style={{ color: '#8B1E2E', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', display: 'inline-block' }}>Request This Service &rarr;</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default HomePage;