// filename: src/pages/ContactPage.jsx
import React, { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", category: "business", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#F8F5F1', minHeight: '100vh' }}>
      <section style={{ backgroundColor: '#0F050A', color: '#F8F5F1', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ color: '#C8B273', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Serving Metro Atlanta, GA & Regional SC
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: '#F8F5F1' }}>What Do You Need Executed?</h1>
          <p style={{ fontSize: '1.15rem', color: '#D1C7BD' }}>Connect directly with a DANI DECLARES LLC deployment coordinator. Serving Metro Atlanta, GA & Regional SC, plus nationwide virtual services.</p>
        </div>
      </section>
      <section style={{ padding: '4rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: '8px', padding: '2.5rem' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3 style={{ color: '#8B1E2E', fontSize: '1.5rem', fontWeight: '800' }}>Request Received!</h3>
              <p style={{ color: '#5A4A52', marginTop: '0.5rem' }}>A deployment coordinator is reviewing your specifications and will respond within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginBottom: '0.4rem' }}>What type of execution do you need?</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #CCC' }}>
                  <option value="business">Business Solutions & PMO Support</option>
                  <option value="property">Property Turnover & Real Estate Support</option>
                  <option value="concierge">Mobile Notary, POAs & Legal Couriers</option>
                  <option value="print">Custom Printing, Apparel & SmartTap™ NFC</option>
                  <option value="events">Event Logistics & Officiant Services</option>
                  <option value="shop">Express Goods & Snack Orders</option>
                </select>
              </div>
              <div>
                <label style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginBottom: '0.4rem' }}>Your Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #CCC' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #CCC' }} />
                </div>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginBottom: '0.4rem' }}>Phone Number</label>
                  <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #CCC' }} />
                </div>
              </div>
              <div>
                <label style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginBottom: '0.4rem' }}>Project Specifications / Details</label>
                <textarea rows="4" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #CCC' }} placeholder="Describe timeline, location, and specific deliverables..."></textarea>
              </div>
              <button type="submit" style={{ backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '0.9rem', border: 'none', borderRadius: '4px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' }}>Submit Execution Specifications &rarr;</button>
            </form>
          )}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center', color: '#5A4A52', fontSize: '0.95rem', backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: '8px', padding: '1.5rem' }}>
          <p><strong>Service Area:</strong> Serving Metro Atlanta, GA & Regional SC</p>
          <p><strong>Direct Dispatch Line:</strong> (470) 485-7173 | (470) 523-4892</p>
          <p><strong>Vendor & Contracting Email:</strong> vendors@danideclares.com | admin@danideclares.com</p>
        </div>
      </section>
    </div>
  );
}
