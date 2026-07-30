// filename: src/pages/portal/AdminDashboardPage.jsx
import React from 'react';
import { calculateSubcontractorSplit } from '../../services/stripeConnectSplitter';

export default function AdminDashboardPage() {
  const sampleRevenue = 12500; // $12,500 total monthly solution sales
  const split = calculateSubcontractorSplit(sampleRevenue);

  const activeJobs = [
    { id: 'REQ-1081', client: 'All3 Realty', type: '3BR Unit Turnover', status: 'IN_PROGRESS', val: 450 },
    { id: 'REQ-1082', client: 'ABC Brokerage', type: 'Loan Signing Package', status: 'COMPLETED', val: 150 },
    { id: 'REQ-1083', client: 'Sarah Jenkins', type: 'Residential Deep Clean', status: 'PAID', val: 200 }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#F6F0E4', color: '#21191A', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#6B1F2B', marginBottom: '8px' }}>
          DANI DECLARES LLC — Executive Financial &amp; Dispatch Reporting
        </h1>
        <p style={{ color: '#555', marginBottom: '28px' }}>Real-Time Solution Sales, Subcontractor Payout Splits &amp; Dispatch Queue</p>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', borderTop: '4px solid #6B1F2B', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#666' }}>MONTHLY REVENUE</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#6B1F2B', margin: '8px 0' }}>{split.totalInvoiceAmount}</div>
            <div style={{ fontSize: '12px', color: '#28A745' }}>↑ 100% Verified Payments</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', borderTop: '4px solid #C9A45C', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#666' }}>FIELD CREW PAYOUTS (60%)</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#21191A', margin: '8px 0' }}>{split.crewPayout}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Automated Stripe Connect Split</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', borderTop: '4px solid #6B1F2B', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#666' }}>NET PLATFORM FEE (40%)</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#6B1F2B', margin: '8px 0' }}>{split.netPlatformFee}</div>
            <div style={{ fontSize: '12px', color: '#28A745' }}>Net Profit Retained</div>
          </div>
        </div>

        {/* Active Dispatch Queue */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#6B1F2B', marginBottom: '16px' }}>Active Dispatch &amp; Execution Queue</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #EDE2D0', color: '#666' }}>
                <th style={{ padding: '10px' }}>Tracking ID</th>
                <th style={{ padding: '10px' }}>Client Name</th>
                <th style={{ padding: '10px' }}>Service Type</th>
                <th style={{ padding: '10px' }}>Value</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeJobs.map((j) => (
                <tr key={j.id} style={{ borderBottom: '1px solid #EDE2D0' }}>
                  <td style={{ padding: '12px 10px', fontWeight: '800', color: '#6B1F2B' }}>{j.id}</td>
                  <td style={{ padding: '12px 10px' }}>{j.client}</td>
                  <td style={{ padding: '12px 10px' }}>{j.type}</td>
                  <td style={{ padding: '12px 10px', fontWeight: '700' }}>${j.val}.00</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ backgroundColor: j.status === 'PAID' ? '#D4EDDA' : '#FFF3CD', color: j.status === 'PAID' ? '#155724' : '#856404', padding: '4px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '12px' }}>
                      {j.status}
                    </span>
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
