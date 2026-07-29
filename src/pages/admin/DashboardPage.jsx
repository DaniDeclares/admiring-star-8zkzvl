import React, { useState } from "react";

export default function DashboardPage() {
  const [filter, setFilter] = useState("all");
  const [requests, setRequests] = useState([
    { id: "REQ-1081", client: "All3 Realty / Unit 4B", category: "Field Services", title: "Unit Turnover & Deep Clean", status: "Dispatched", date: "2026-07-29", price: "50.00", photoLog: "Ready (2-Hr SLA)" },
    { id: "REQ-1082", client: "Eva Mawati / Law Firm", category: "Document & Compliance", title: "Mobile Loan Signing & Courier", status: "New", date: "2026-07-29", price: "50.00", photoLog: "N/A" },
    { id: "REQ-1083", client: "Apex Prime Contracting", category: "Government & Admin", title: "Admin Subcontracting Teaming", status: "Quoted", date: "2026-07-28", price: ",500.00", photoLog: "N/A" },
    { id: "REQ-1084", client: "Metro Business Client", category: "Print & Merchandise", title: "10x SmartTap™ NFC Cards", status: "Paid", date: "2026-07-27", price: "90.00", photoLog: "Shipped" }
  ]);

  const updateStatus = (id, newStatus) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.category.toLowerCase() === filter.toLowerCase());

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#F8F5F1', minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#8B1E2E', backgroundColor: '#F3ECE7', padding: '0.25rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase' }}>
              Internal Command Center
            </span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginTop: '0.25rem', color: '#1B0A0E' }}>
              Dani Declares Dispatch Queue
            </h1>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #E2D9D0', textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#5A4A52' }}>Active Revenue Tracked</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#8B1E2E' }}>,590.00</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {["all", "Field Services", "Document & Compliance", "Government & Admin", "Print & Merchandise", "Events & Logistics"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              backgroundColor: filter === f ? '#8B1E2E' : '#FFFFFF',
              color: filter === f ? '#FFFFFF' : '#1B0A0E',
              border: '1px solid #E2D9D0', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', textTransform: 'capitalize'
            }}>
              {f}
            </button>
          ))}
        </div>

        {/* Lead Pipeline Queue Table */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9D0', borderRadius: '8px', overflowX: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.925rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0F050A', color: '#F8F5F1' }}>
                <th style={{ padding: '1rem' }}>Request ID</th>
                <th style={{ padding: '1rem' }}>Client / Property</th>
                <th style={{ padding: '1rem' }}>Division</th>
                <th style={{ padding: '1rem' }}>Service Title</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>HD Photo Log</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #E2D9D0' }}>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#8B1E2E' }}>{r.id}</td>
                  <td style={{ padding: '1rem' }}>{r.client}</td>
                  <td style={{ padding: '1rem' }}><span style={{ backgroundColor: '#F3ECE7', color: '#8B1E2E', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>{r.category}</span></td>
                  <td style={{ padding: '1rem' }}>{r.title}</td>
                  <td style={{ padding: '1rem' }}>
                    <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', fontWeight: '700', border: '1px solid #CCC' }}>
                      <option value="New">New</option>
                      <option value="Quoted">Quoted</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Invoiced">Invoiced</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem', color: r.photoLog.includes("Ready") ? '#16A34A' : '#5A4A52', fontWeight: '600' }}>{r.photoLog}</td>
                  <td style={{ padding: '1rem', fontWeight: '800', color: '#C8B273' }}>{r.price}</td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ backgroundColor: '#C8B273', color: '#0F050A', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                      Send SMS Alert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
