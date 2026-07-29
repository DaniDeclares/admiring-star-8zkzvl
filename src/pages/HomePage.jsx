import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
  const divisions = [
    {
      title: 'Property & Field Logistics',
      category: 'Property Management & Real Estate',
      text: 'Multi-family unit turnover resets, deep cleaning, carpet hot-water extraction, post-construction debris removal, and HD photo condition logs.',
      path: '/services/property',
      cta: 'View Property Services',
      img: '/images/stock/property-cleaning-turnover.jpg'
    },
    {
      title: 'Print & Merchandise Studio',
      category: 'Branding & Apparel',
      text: 'Custom heat-press apparel, branded corporate merch, retail product packaging labels, stickers, and promotional marketing collateral.',
      path: '/services/print-studio',
      cta: 'Explore Print Studio',
      img: '/images/stock/Clipboards.jpg'
    },
    {
      title: 'Legal Compliance & Mobile Notary',
      category: 'Legal & Administrative',
      text: 'Mobilized document preparation, loan signings, living trusts, durable POAs, regional court filings, and international apostille processing.',
      path: '/services/concierge',
      cta: 'Book Notary & Filings',
      img: '/images/stock/legal paperwork desk.jpg'
    },
    {
      title: 'Business & Operations Solutions',
      category: 'Enterprise Support',
      text: 'Administrative execution, document management, operational workflows, and dedicated project coordination for growing companies.',
      path: '/services/business-solutions',
      cta: 'View Business Solutions',
      img: '/images/stock/mobile notary public.jpg'
    },
    {
      title: 'Express Goods & Local Delivery',
      category: 'Marketplace & Convenience',
      text: 'On-demand neighborhood snack packs, back-to-school bundles, sweet & savory combo boxes, and daily doorstep delivery.',
      path: '/shop',
      cta: 'Shop Express Goods',
      img: '/images/stock/file cabinet.jpg'
    },
    {
      title: 'Government Contracting (B2G)',
      category: 'Federal & State Compliance',
      text: 'SAM.gov registered subcontractor ready for agency operations. Credentials: UEI (TD4TSG48LHN9), CAGE Code (17VV2), Primary NAICS 561410.',
      path: '/industries/government',
      cta: 'GovCon Profile',
      img: '/images/stock/court%20building%20exterior.jpg'
    }
  ];

  const snackCombos = [
    { name: '$3.00 Quick Snack Pack', desc: '1 Snack + 1 Cold Drink + 1 Sweet Treat' },
    { name: '$5.00 Gamer Pack', desc: '2 Chip/Savory Snacks + 1 Gatorade + 1 Full-Size Candy + 1 Frozen Treat' },
    { name: '$10.00 Family Movie Night', desc: '12 Items: 4 Snacks + 4 Drinks + 4 Sweet Treats' }
  ];

  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333', minHeight: '100vh' }}>
      <Helmet>
        <title>Mobile Operations & Corporate Execution Support | Dani Declares LLC</title>
        <meta name="description" content="Dani Declares LLC provides property turnover cleaning, custom merchandise printing, mobile notary compliance, and local express goods delivery across Metro Atlanta." />
        <meta name="keywords" content="mobile operations, property turnover cleaning, custom t-shirt printing, mobile notary public, government subcontractor, express goods delivery" />
      </Helmet>

      {/* Hero Section */}
      <section style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '80px 20px 70px 20px', textAlign: 'center', borderBottom: '6px solid #D4AF37' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span style={{ backgroundColor: '#D4AF37', color: '#111', padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '20px' }}>
            Mobile Operations &amp; Execution Support
          </span>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '800', margin: '0 0 20px 0', lineHeight: '1.15', letterSpacing: '-0.5px' }}>
            One Company. Total Execution.
          </h1>
          <p style={{ fontSize: 'clamp(17px, 2.5vw, 21px)', margin: '0 auto 36px auto', maxWidth: '780px', lineHeight: '1.5', opacity: '0.95' }}>
            We come directly to your location and handle the process from start to submission. Serving property managers, business owners, legal firms, and families across Metro Atlanta and South Carolina.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '700px', margin: '0 auto 30px auto' }}>
            <Link to="/book" style={{ backgroundColor: '#D4AF37', color: '#111', padding: '16px 36px', borderRadius: '6px', fontWeight: '700', textDecoration: 'none', fontSize: '17px', flex: '1 1 240px', minWidth: '220px', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', border: '2px solid #D4AF37' }}>
              Launch Service Request &rarr;
            </Link>
            <Link to="/services" style={{ backgroundColor: 'transparent', color: '#fff', padding: '16px 36px', borderRadius: '6px', fontWeight: '700', textDecoration: 'none', fontSize: '17px', flex: '1 1 240px', minWidth: '220px', textAlign: 'center', border: '2px solid #fff' }}>
              Explore All Divisions
            </Link>
          </div>

          <div style={{ fontSize: '15px', fontWeight: '600' }}>
            Direct Handler: <a href="tel:4706829348" style={{ color: '#D4AF37', textDecoration: 'underline' }}>(470) 682-9348</a>
          </div>
        </div>
      </section>

      {/* Trust Credential Anchor Bar */}
      <section style={{ backgroundColor: '#fff', padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #E5E0DA', fontSize: '14px', color: '#555', fontWeight: '600' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <span>GA SOS Control No. 25079444</span>
          <span>•</span>
          <span>SAM.gov Registered</span>
          <span>•</span>
          <span>UEI: TD4TSG48LHN9</span>
          <span>•</span>
          <span>CAGE Code: 17VV2</span>
          <span>•</span>
          <span>W-9 &amp; COI Verified</span>
        </div>
      </section>

      {/* Solutions Grid */}
      <section style={{ padding: '70px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '36px', color: '#8B1E2E', margin: '0 0 12px 0', fontWeight: '800' }}>
            Select Your Operation Lane
          </h2>
          <p style={{ color: '#666', fontSize: '17px', maxWidth: '650px', margin: '0 auto' }}>
            Choose a specialized division below to review our capabilities or launch your project request.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {divisions.map((item) => (
            <Link 
              to={item.path} 
              key={item.title} 
              style={{ textDecoration: 'none', color: 'inherit', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', borderTop: '4px solid #8B1E2E', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ height: '180px', backgroundColor: '#e0e0e0' }}>
                <img 
                  src={item.img} 
                  alt={item.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => { e.target.src = '/images/stock/file cabinet.jpg'; }} 
                />
              </div>
              <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {item.category}
                </span>
                <h3 style={{ fontSize: '20px', color: '#111', margin: '0 0 10px 0', fontWeight: '700' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px', flexGrow: 1 }}>
                  {item.text}
                </p>
                <span style={{ color: '#8B1E2E', fontWeight: '700', fontSize: '14px' }}>
                  {item.cta} &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Express & Goods Spotlight */}
      <section style={{ backgroundColor: '#fff', padding: '60px 20px', borderTop: '1px solid #E5E0DA', borderBottom: '1px solid #E5E0DA' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 400px' }}>
            <span style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
              Local On-Demand
            </span>
            <h2 style={{ fontSize: '32px', color: '#111', margin: '12px 0', fontWeight: '800' }}>
              Dani Declares Express &amp; Goods
            </h2>
            <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
              Your neighborhood spot for curated snack packs, combo boxes, cold drinks, and sweet treats—delivered directly to your door. Order single items or pre-packaged combo boxes online.
            </p>
            <Link to="/shop" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '12px 28px', borderRadius: '6px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}>
              Browse Snack Menu &amp; Shop &rarr;
            </Link>
          </div>

          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {snackCombos.map((combo) => (
              <div key={combo.name} style={{ backgroundColor: '#F8F5F1', padding: '16px 20px', borderRadius: '8px', borderLeft: '4px solid #D4AF37' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#111', fontWeight: '700' }}>{combo.name}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{combo.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '70px 20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', color: '#8B1E2E', marginBottom: '40px', fontWeight: '800' }}>
          The Execution Model
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
          <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#8B1E2E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontWeight: '700' }}>1</div>
            <h3 style={{ fontSize: '18px', margin: '0 0 10px 0', fontWeight: '700' }}>Submit Requirements</h3>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Select your service line or product order and submit your project details via our digital intake form.</p>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#8B1E2E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontWeight: '700' }}>2</div>
            <h3 style={{ fontSize: '18px', margin: '0 0 10px 0', fontWeight: '700' }}>Mobilized Dispatch</h3>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Our team deploys directly on-site or handles print/packaging production with guaranteed turnaround times.</p>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#8B1E2E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontWeight: '700' }}>3</div>
            <h3 style={{ fontSize: '18px', margin: '0 0 10px 0', fontWeight: '700' }}>Verified Completion</h3>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Receive digital photo logs, proof of filing/sign-off, or doorstep delivery of your completed order.</p>
          </div>
        </div>
      </section>

      {/* Bottom Conversion Callout */}
      <section style={{ backgroundColor: '#111', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', margin: '0 0 16px 0', fontWeight: '800' }}>Ready to Execute Your Project?</h2>
          <p style={{ fontSize: '17px', color: '#ccc', marginBottom: '28px' }}>
            Whether you need property turnover cleaning, custom apparel printing, legal document filings, or local snack delivery—we have you covered.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/book" style={{ backgroundColor: '#D4AF37', color: '#111', padding: '14px 32px', borderRadius: '6px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}>
              Launch Intake Form &rarr;
            </Link>
            <a href="tel:4706829348" style={{ backgroundColor: 'transparent', color: '#fff', padding: '14px 32px', borderRadius: '6px', fontWeight: '700', textDecoration: 'none', fontSize: '16px', border: '1px solid #444' }}>
              Call (470) 682-9348
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
