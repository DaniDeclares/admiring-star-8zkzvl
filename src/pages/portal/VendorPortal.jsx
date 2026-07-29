import React, { useState } from "react";

export default function VendorPortal() {
  const [form, setForm] = useState({ company: "", name: "", email: "", phone: "", insured: true, w9Uploaded: false });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#F8F5F1', minHeight: '100vh', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: '8px', padding: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#8B1E2E', marginBottom: '0.5rem' }}>
          Subcontractor & Vendor Network Onboarding
        </h1>
        <p style={{ color: '#5A4A52', marginBottom: '2rem' }}>
          Join Dani Declares LLC's approved field execution and subcontractor network across Metro Atlanta and regional service areas.
        </p>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#DCFCE7', borderRadius: '6px' }}>
            <h3 style={{ color: '#15803D', fontSize: '1.4rem', fontWeight: '800' }}>Application Received!</h3>
            <p style={{ color: '#166534', marginTop: '0.5rem' }}>Our vendor compliance team will verify your COI and W-9 credentials within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Business Name / Contractor Name</label>
              <input type="text" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #CCC' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Contact Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #CCC' }} />
              </div>
              <div>
                <label style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Phone Number</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #CCC' }} />
              </div>
            </div>

            <div>
              <label style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #CCC' }} />
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#FAF8F5', borderRadius: '4px', border: '1px solid #E2D9D0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={form.insured} onChange={(e) => setForm({ ...form, insured: e.target.checked })} />
                I confirm our business holds active General Liability Insurance (M+ Coverage).
              </label>
            </div>

            <button type="submit" style={{ backgroundColor: '#8B1E2E', color: '#FFFFFF', padding: '0.9rem', border: 'none', borderRadius: '4px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' }}>
              Submit Vendor Compliance Application &rarr;
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
