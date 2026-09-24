import React, { useEffect, useMemo, useState } from 'react';
import RequireSalesAuth from '../../components/auth/RequireSalesAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';
import '../../pages/portal/OperationsConsolePage.css';

const SALES_DISPOSITIONS = ['NOT_CONTACTED','NO_ANSWER','VOICEMAIL','RECEPTIONIST','WRONG_PERSON','DECISION_MAKER_REACHED','INTERESTED','NEEDS_INFO','QUOTE_REQUESTED','READY_TO_BUY','PAYMENT_SENT','PAYMENT_SUCCEEDED','CALL_BACK_LATER','NOT_INTERESTED','EXISTING_VENDOR_REVISIT','DO_NOT_CONTACT'];
const COMMISSION_LABELS = { ACCRUING: 'Accruing', EARNED: 'Earned', HELD_FOR_REVIEW: 'Held for review', PAID: 'Paid', VOID: 'Void' };

function money(n) { return `$${Number(n || 0).toFixed(2)}`; }
function isToday(d) { if (!d) return false; return d <= new Date().toISOString().slice(0, 10); }

function LeadRow({ row, onSave }) {
  const [disposition, setDisposition] = useState(row.disposition);
  const [nextAction, setNextAction] = useState(row.next_action || '');
  const [nextActionDate, setNextActionDate] = useState(row.next_action_date || '');
  const [quotedAmount, setQuotedAmount] = useState(row.quoted_amount == null ? '' : row.quoted_amount);
  const [amountCollected, setAmountCollected] = useState(row.amount_collected || 0);
  const [painPoint, setPainPoint] = useState(row.pain_point || '');
  const [impact, setImpact] = useState(row.impact_statement || '');
  const [nextStep, setNextStep] = useState(row.next_step_commitment || '');
  const dirty = disposition !== row.disposition || nextAction !== (row.next_action || '') || nextActionDate !== (row.next_action_date || '') ||
    String(quotedAmount) !== String(row.quoted_amount == null ? '' : row.quoted_amount) || String(amountCollected) !== String(row.amount_collected || 0) ||
    painPoint !== (row.pain_point || '') || impact !== (row.impact_statement || '') || nextStep !== (row.next_step_commitment || '');

  return (
    <div className="ops-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
      <div>
        <strong>{row.contact_name}</strong>{row.company_name && <small> · {row.company_name}</small>}
        <br /><small>{row.phone || ''}{row.phone && row.email ? ' · ' : ''}{row.email || ''}</small>
        <div style={{ fontSize: 12, marginTop: 5 }}><strong>Priority {row.priority_score ?? '—'}</strong> · {String(row.sales_stage || '').replaceAll('_', ' ')} · {String(row.timing_signal || '').replaceAll('_', ' ')}</div>
        <div style={{ fontSize: 12, color: '#6d5b60' }}>{row.recommended_action || ''}</div>
        {!row.salesperson_user_id && <div style={{ fontSize: 11, color: '#a15c00', marginTop: 3 }}>Unassigned pool lead — editing it assigns it to you</div>}
      </div>
      <div className="ops-actions" style={{ flexWrap: 'wrap', gap: 8 }}>
        <select value={disposition} onChange={e => setDisposition(e.target.value)}>{SALES_DISPOSITIONS.map(d => <option key={d} value={d}>{d.replaceAll('_', ' ')}</option>)}</select>
        <input type="text" placeholder="Next action" value={nextAction} onChange={e => setNextAction(e.target.value)} style={{ minWidth: 160 }} />
        <input type="date" value={nextActionDate || ''} onChange={e => setNextActionDate(e.target.value)} />
        <input type="number" placeholder="Quoted $" value={quotedAmount} onChange={e => setQuotedAmount(e.target.value)} style={{ width: 90 }} />
        <input type="number" placeholder="Collected $" value={amountCollected} onChange={e => setAmountCollected(e.target.value)} style={{ width: 100 }} />
        <input type="text" placeholder="Pain" value={painPoint} onChange={e => setPainPoint(e.target.value)} style={{ minWidth: 140 }} />
        <input type="text" placeholder="Impact" value={impact} onChange={e => setImpact(e.target.value)} style={{ minWidth: 140 }} />
        <input type="text" placeholder="Committed next step" value={nextStep} onChange={e => setNextStep(e.target.value)} style={{ minWidth: 160 }} />
        {dirty && <button onClick={() => onSave(row.id, {
          p_disposition: disposition, p_next_action: nextAction || null, p_next_action_date: nextActionDate || null,
          p_quoted_amount: quotedAmount === '' ? null : Number(quotedAmount), p_amount_collected: Number(amountCollected || 0),
          p_pain_point: painPoint || null, p_impact_statement: impact || null, p_next_step_commitment: nextStep || null,
        })}>Save</button>}
      </div>
    </div>
  );
}

function SalesWorkspace({ isOwner }) {
  const [leads, setLeads] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    const [{ data: leadRows, error: leadError }, { data: commissionRows, error: commissionError }] = await Promise.all([
      supabase.rpc('dd_get_sales_dashboard_leads', { p_limit: 150, p_mine_only: true }),
      supabase.rpc('dd_get_my_sales_commissions', { p_limit: 200 }),
    ]);
    if (leadError) { setError(leadError.message); setLoading(false); return; }
    if (commissionError) { setError(commissionError.message); setLoading(false); return; }
    setLeads(leadRows || []);
    setCommissions(commissionRows || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveLead = async (id, patch) => {
    setMessage(''); setError('');
    const { error: e } = await supabase.rpc('dd_update_my_sales_lead', { p_id: id, ...patch });
    if (e) setError(e.message); else { setMessage('Lead updated.'); await load(); }
  };

  const metrics = useMemo(() => {
    const assigned = leads.filter(l => l.salesperson_user_id).length;
    const contacted = leads.filter(l => l.disposition !== 'NOT_CONTACTED').length;
    const followUpsDue = leads.filter(l => isToday(l.next_action_date)).length;
    const quotesSent = leads.filter(l => l.quoted_amount != null || l.disposition === 'QUOTE_REQUESTED').length;
    const closed = leads.filter(l => Number(l.amount_collected || 0) > 0 || l.disposition === 'PAYMENT_SUCCEEDED').length;
    const conversion = assigned ? Math.round((closed / assigned) * 100) : 0;
    const commissionTotals = commissions.reduce((acc, c) => {
      const amt = Number(c.commission_amount || 0);
      if (c.commission_status === 'PAID') acc.paid += amt;
      else if (c.commission_status === 'EARNED') acc.earned += amt;
      else if (c.commission_status === 'ACCRUING') acc.accrued += amt;
      else if (c.commission_status === 'HELD_FOR_REVIEW') acc.held += amt;
      return acc;
    }, { accrued: 0, earned: 0, paid: 0, held: 0 });
    return { assigned, contacted, followUpsDue, quotesSent, closed, conversion, commissionTotals };
  }, [leads, commissions]);

  const followUps = leads.filter(l => isToday(l.next_action_date));
  const rest = leads.filter(l => !isToday(l.next_action_date));

  return (
    <main className="ops-shell">
      <header className="ops-hero">
        <div>
          <p className="ops-eyebrow">DANI DECLARES SALES</p>
          <h1>{isOwner ? 'Sales Workspace (owner view — all agents)' : 'My Sales Workspace'}</h1>
          <p>Your assigned leads, today's follow-ups, and what you've earned. Pricing and eligibility stay governed elsewhere — this is where you work the conversation.</p>
        </div>
      </header>
      {error && <div className="ops-alert">{error}</div>}
      {message && <div className="ops-alert" style={{ background: '#edf8ef', color: '#276b35' }}>✓ {message}</div>}
      <section className="ops-stats">
        <div className="ops-stat"><span>Assigned</span><strong>{loading ? '…' : metrics.assigned}</strong><small>Leads on your board</small></div>
        <div className="ops-stat"><span>Follow-ups due</span><strong>{loading ? '…' : metrics.followUpsDue}</strong><small>Today</small></div>
        <div className="ops-stat"><span>Contacted</span><strong>{loading ? '…' : metrics.contacted}</strong><small>Past NOT_CONTACTED</small></div>
        <div className="ops-stat"><span>Quotes sent</span><strong>{loading ? '…' : metrics.quotesSent}</strong><small>Quoted or requested</small></div>
        <div className="ops-stat"><span>Closed/collected</span><strong>{loading ? '…' : metrics.closed}</strong><small>{metrics.conversion}% conversion</small></div>
        <div className="ops-stat"><span>Commission accrued</span><strong>{loading ? '…' : money(metrics.commissionTotals.accrued)}</strong><small>Not yet earned</small></div>
        <div className="ops-stat"><span>Commission earned</span><strong>{loading ? '…' : money(metrics.commissionTotals.earned)}</strong><small>Awaiting payout</small></div>
        <div className="ops-stat"><span>Commission paid</span><strong>{loading ? '…' : money(metrics.commissionTotals.paid)}</strong><small>Lifetime</small></div>
      </section>
      <section className="ops-workspace">
        <div className="ops-card">
          <h3>Today's follow-ups ({followUps.length})</h3>
          {followUps.map(row => <LeadRow key={row.id} row={row} onSave={saveLead} />)}
          {!followUps.length && <p className="ops-note">Nothing due today.</p>}
        </div>
        <div className="ops-card">
          <h3>{isOwner ? 'All leads' : 'My leads & pool'} ({rest.length})</h3>
          {rest.map(row => <LeadRow key={row.id} row={row} onSave={saveLead} />)}
          {!rest.length && !loading && <p className="ops-note">No other leads right now.</p>}
        </div>
        <div className="ops-card">
          <h3>Commission ledger</h3>
          {commissions.map(c => (
            <div className="ops-row" key={c.id}>
              <div>
                <strong>{c.contact_name || 'Closed sale'}</strong>{c.company_name && <small> · {c.company_name}</small>}
                <br /><small>{c.policy_code || 'Unpoliced'} · {money(c.collected_revenue_basis)} collected · {c.commission_rate != null ? `${(c.commission_rate * 100).toFixed(0)}%` : '—'} rate</small>
                {c.economics_guardrail_status === 'FAIL' && <div style={{ fontSize: 11, color: '#a13030', marginTop: 3 }}>Guardrail failed — held for owner review</div>}
              </div>
              <div style={{ fontWeight: 600 }}>{money(c.commission_amount)} · {COMMISSION_LABELS[c.commission_status] || c.commission_status}</div>
            </div>
          ))}
          {!commissions.length && !loading && <p className="ops-note">No commission activity yet.</p>}
        </div>
      </section>
      <footer className="ops-footer"><strong>Your own pipeline and earnings only.</strong> Owner-only accounting, provider economics and other agents' performance stay in Operations Console.</footer>
    </main>
  );
}

export default function SalesWorkspacePage() {
  return <RequireSalesAuth>{(state) => <SalesWorkspace isOwner={state.isOwner} />}</RequireSalesAuth>;
}
