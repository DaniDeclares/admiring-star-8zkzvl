// filename: src/components/BookingFormHandler.jsx
import React, { useState } from 'react';

export default function BookingFormHandler() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'prop',
    details: '',
    pathway: 'property',
    zipCode: '',
    urgency: 'medium'
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanZip = String(formData.zipCode || '').trim();

    try {
      const res = await fetch('/api/intake-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, zipCode: cleanZip })
      });

      const result = await res.json();
      setLoading(false);

      if (res.ok && result.success) {
        setResponse({ success: true, message: 'Request submitted! Tracking ID: ' + result.publicId });
      } else {
        setResponse({ success: false, message: result.error || 'Submission failed.' });
      }
    } catch (err) {
      setLoading(false);
      setResponse({ success: false, message: 'Network error. Please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px', margin: '0 auto' }}>
      <input 
        type="text" 
        placeholder="Your Name *" 
        value={formData.name} 
        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
        required 
        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #CCC' }}
      />
      <input 
        type="email" 
        placeholder="Email Address *" 
        value={formData.email} 
        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
        required 
        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #CCC' }}
      />
      <input 
        type="text" 
        placeholder="ZIP Code (e.g. 30084) *" 
        value={formData.zipCode} 
        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} 
        required 
        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #CCC' }}
      />
      <textarea 
        placeholder="Project Details..." 
        value={formData.details} 
        onChange={(e) => setFormData({ ...formData, details: e.target.value })} 
        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #CCC', minHeight: '100px' }}
      />
      <button 
        type="submit" 
        disabled={loading} 
        style={{ backgroundColor: '#6B1F2B', color: '#F6F0E4', padding: '12px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer', border: 'none' }}>
        {loading ? 'Submitting...' : 'TELL US WHAT YOU NEED →'}
      </button>

      {response && (
        <div style={{ padding: '10px', borderRadius: '4px', backgroundColor: response.success ? '#D4EDDA' : '#F8D7DA', color: response.success ? '#155724' : '#721C24' }}>
          {response.message}
        </div>
      )}
    </form>
  );
}
