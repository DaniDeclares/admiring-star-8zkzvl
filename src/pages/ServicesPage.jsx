import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const ServicesPage = () => {
  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', paddingBottom: '60px' }}>
      <Helmet><title>Our Services | Dani Declares LLC</title></Helmet>
      
      {/* Banner */}
      <div style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', margin: '0 0 12px 0' }}>What We Handle</h1>
        <p style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto', opacity: '0.9', lineHeight: '1.5' }}>Complete service divisions. One company. We come to you and handle the entire process cleanly.</p>
      </div>

      <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Division 1 */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <h2 style={{ color: '#8B1E2E', margin: '0 0 8px 0' }}>On-Site Field Logistics &amp; Property Reset</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}><strong>Who it's for:</strong> Property managers, landlords, real estate agents, Airbnb hosts, contractors, and investors.</p>
          <ul style={{ lineHeight: '1.8', paddingLeft: '20px', marginBottom: '24px' }}>
            <li>Move-In / Move-Out Cleaning (from $300)</li>
            <li>Deep Cleaning &amp; Detailed Structural Restorations (from $400)</li>
            <li>Rental &amp; Airbnb Turnovers</li>
            <li>Post-Construction Detail Cleanup</li>
            <li>Full Property Reset Package ($500 – $1,500)</li>
          </ul>
          <Link to="/field-services" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>View Field Services</Link>
        </div>

        {/* Division 2 */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <h2 style={{ color: '#8B1E2E', margin: '0 0 8px 0' }}>Event Planning &amp; Execution</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}><strong>Who it's for:</strong> Couples, families, businesses, organizations, and community groups.</p>
          <ul style={{ lineHeight: '1.8', paddingLeft: '20px', marginBottom: '24px' }}>
            <li>Full Wedding Planning &amp; Direct Timeline Management</li>
            <li>Wedding Officiating Services</li>
            <li>Party &amp; Celebration Layout Coordination</li>
            <li>Day-Of Coordination Support</li>
            <li>Balloon Arches &amp; Custom On-Site Decor Installations</li>
          </ul>
          <Link to="/events" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>View Events Services</Link>
        </div>

        {/* Division 3 */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <h2 style={{ color: '#8B1E2E', margin: '0 0 8px 0' }}>Administrative &amp; Document Management</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}><strong>Who it's for:</strong> Individuals, businesses, law firms, tax offices, and HR departments.</p>
          <ul style={{ lineHeight: '1.8', paddingLeft: '20px', marginBottom: '24px' }}>
            <li>Mobile Notary Support (SC Active / GA Pending)</li>
            <li>POAs, Trusts, &amp; Estate Affidavits</li>
            <li>I-9 Employment Verification Support</li>
            <li>Apostille Processing &amp; Courier Filing</li>
            <li>Document Preparation (Non-Attorney Regulatory Layouts)</li>
          </ul>
          <Link to="/request-service" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>Book Document Services</Link>
        </div>

        {/* Division 4 */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <h2 style={{ color: '#8B1E2E', margin: '0 0 8px 0' }}>Mobile Courier Services</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}><strong>Who it's for:</strong> Law firms, title companies, logistics coordinators, businesses, and medical facilities.</p>
          <ul style={{ lineHeight: '1.8', paddingLeft: '20px', marginBottom: '24px' }}>
            <li>Court Filing Delivery &amp; Case Document Retrieval</li>
            <li>Secure Signature Pickup &amp; Document Delivery</li>
            <li>Hospital, Jail, &amp; Closed Facility Document Routing</li>
            <li>Process Serving Assistance</li>
            <li>Transport Coordination &amp; Document Preparation Packages</li>
          </ul>
          <Link to="/request-service" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>Request Courier Support</Link>
        </div>

        {/* Division 5 */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <h2 style={{ color: '#8B1E2E', margin: '0 0 8px 0' }}>Custom Print &amp; Merchandise Prep</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}><strong>Who it's for:</strong> Small businesses, brand startups, event hosts, and solo operators.</p>
          <ul style={{ lineHeight: '1.8', paddingLeft: '20px', marginBottom: '24px' }}>
            <li>Custom Branding Stickers &amp; Retail Packaging Labels</li>
            <li>Heat-Press Custom Apparel &amp; Team Uniform Prep</li>
            <li>Business Product Starter Kits &amp; Marketing Swag Packs</li>
            <li>Event Seating Charts &amp; Large-Format Display Prints</li>
          </ul>
          <Link to="/request-service" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>Request Custom Printing</Link>
        </div>

      </div>
    </div>
  );
};

export default ServicesPage;