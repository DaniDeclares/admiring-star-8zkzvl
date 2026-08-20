import React, { useCallback, useEffect, useState } from 'react';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { getResidentDispatches, updateResidentDispatch } from '../../services/residentDispatchService.js';

const STATUSES = ['all', 'new', 'confirmed', 'in_progress', 'ready', 'completed', 'cancelled'];

function Queue() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await getResidentDispatches({ status }));
    } catch (err) {
      setError('The fulfillment queue could not be loaded. Verify the Supabase migration and staff role configuration.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, next) => {
    try {
      await updateResidentDispatch(id, { status: next });
      await load();
    } catch (err) {
      setError('The dispatch could not be updated.');
    }
  };

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1>Resident Fulfillment Queue</h1>
      <p>Internal B2C dispatch operations. Resident records are protected by Supabase RLS and trusted staff roles.</p>
      <label htmlFor="dispatch-status">Status</label>{' '}
      <select id="dispatch-status" value={status} onChange={(e) => setStatus(e.target.value)}>
        {STATUSES.map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}
      </select>{' '}
      <button type="button" onClick={load}>Refresh</button>
      {error && <p role="alert">{error}</p>}
      {loading ? <p>Loading…</p> : rows.length === 0 ? <p>No dispatches in this view.</p> : (
        <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          {rows.map((row) => (
            <article key={row.id} style={{ border: '1px solid #d9c79f', borderRadius: 10, padding: 16 }}>
              <strong>{row.service_type}</strong>
              <div>{row.resident_name}{row.unit_label ? ` • Unit ${row.unit_label}` : ''}</div>
              <div>Submitted {new Date(row.created_at).toLocaleString()}</div>
              <div>Quoted total: {row.quoted_total == null ? 'Custom / pending' : `$${Number(row.quoted_total).toFixed(2)}`}</div>
              <div>Priority: {row.priority}</div>
              {row.customer_notes && <p>Customer notes: {row.customer_notes}</p>}
              <label htmlFor={`status-${row.id}`}>Update status</label>{' '}
              <select id={`status-${row.id}`} value={row.status} onChange={(e) => changeStatus(row.id, e.target.value)}>
                {STATUSES.slice(1).map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}
              </select>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default function ResidentFulfillmentPage() {
  return <RequireStaffAuth><Queue /></RequireStaffAuth>;
}
