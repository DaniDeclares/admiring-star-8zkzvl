import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function AppointmentResponsePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const initialAction = searchParams.get('action') === 'change' ? 'change' : 'confirm';
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState('');
  const [changeMessage, setChangeMessage] = useState('');
  const [showChangeForm, setShowChangeForm] = useState(initialAction === 'change');

  useEffect(() => {
    if (!token) { setError('This link is missing information. Call or text (470) 485-7173 for help.'); setLoading(false); return; }
    fetch(`/api/appointment-response?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(body => {
        if (!body.success) { setError(body.error || 'This link could not be loaded.'); return; }
        setAppointment(body.appointment);
      })
      .catch(() => setError('This link could not be loaded. Call or text (470) 485-7173 for help.'))
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async (action, message) => {
    setError(''); setResult('');
    const response = await fetch('/api/appointment-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action, message }),
    });
    const body = await response.json();
    if (!body.success) { setError(body.error || 'Something went wrong.'); return; }
    setResult(body.message);
    if (action === 'confirm') setAppointment(prev => prev ? { ...prev, confirmed: true } : prev);
    if (action === 'request_change') setAppointment(prev => prev ? { ...prev, changeRequested: true } : prev);
  };

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 20px 80px' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, marginBottom: 8 }}>Your appointment</h1>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: '#800020' }}>{error}</p>}
      {appointment && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
            <tbody>
              <tr><td style={{ padding: '8px 0', fontWeight: 700, width: '35%' }}>When</td><td>{appointment.when}</td></tr>
              {appointment.address && <tr><td style={{ padding: '8px 0', fontWeight: 700 }}>Address</td><td>{appointment.address}</td></tr>}
              {appointment.scope && <tr><td style={{ padding: '8px 0', fontWeight: 700 }}>Scope</td><td>{appointment.scope}</td></tr>}
              {appointment.total != null && <tr><td style={{ padding: '8px 0', fontWeight: 700 }}>Total</td><td>${appointment.total.toFixed(2)}</td></tr>}
              {appointment.deposit && <tr><td style={{ padding: '8px 0', fontWeight: 700 }}>Deposit</td><td>${appointment.deposit.amount.toFixed(2)} — {appointment.deposit.status === 'cleared' ? 'received' : 'pending, not yet cleared'}</td></tr>}
              {appointment.remainingBalance != null && <tr><td style={{ padding: '8px 0', fontWeight: 700 }}>Remaining balance</td><td>${appointment.remainingBalance.toFixed(2)}</td></tr>}
            </tbody>
          </table>

          {result && <p style={{ color: '#276b35', fontWeight: 600 }}>{result}</p>}

          {!appointment.confirmed && !result && !showChangeForm && (
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={() => submit('confirm')} style={{ padding: '12px 20px', background: '#800020', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700 }}>Confirm Appointment</button>
              <button onClick={() => setShowChangeForm(true)} style={{ padding: '12px 20px', background: '#fff', color: '#800020', border: '1px solid #800020', borderRadius: 7, fontWeight: 700 }}>Request a Change</button>
            </div>
          )}
          {appointment.confirmed && !result && <p>You already confirmed this appointment. Need something else? Use Request a Change below.</p>}

          {showChangeForm && !result && (
            <div style={{ marginTop: 16 }}>
              <textarea value={changeMessage} onChange={e => setChangeMessage(e.target.value)} placeholder="What needs to change?" rows={4} style={{ width: '100%', padding: 10, fontFamily: 'inherit' }} />
              <div style={{ marginTop: 10, display: 'flex', gap: 12 }}>
                <button onClick={() => submit('request_change', changeMessage)} disabled={!changeMessage.trim()} style={{ padding: '12px 20px', background: '#800020', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700 }}>Send Request</button>
                <button onClick={() => setShowChangeForm(false)} style={{ padding: '12px 20px', background: 'transparent', border: 'none', color: '#514847' }}>Cancel</button>
              </div>
            </div>
          )}

          <p style={{ marginTop: 32, color: '#514847', fontSize: 14 }}>Questions before then? Call or text <a href="tel:+14704857173">(470) 485-7173</a>.</p>
        </div>
      )}
    </main>
  );
}
