import React from 'react';
import ProviderNav from './ProviderNav.jsx';
import { useProviderWorkspace } from './ProviderWorkspaceContext.jsx';

const money = value => value == null ? 'Not set' : '$' + Number(value).toFixed(2);

export default function ProviderBenefitsPage() {
  const { snapshot, loading, error } = useProviderWorkspace();
  if (loading) return <main className="portal-shell"><p>Loading benefits…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;
  const benefits=snapshot?.benefits||{programs:[],rewards:[],counts:{earned:0,pending:0,paid:0,expired:0}};
  return <main className="portal-shell">
    <ProviderNav snapshot={snapshot}/>
    <section className="portal-card">
      <h1>Benefits & Incentives</h1>
      <p>Track active programs, eligibility, referrals, and earned or pending rewards. A referral application alone never creates a payable reward.</p>
      <div className="portal-summary-grid">
        <div className="portal-summary-tile"><strong>{benefits.counts?.pending||0}</strong><span>Pending</span></div>
        <div className="portal-summary-tile"><strong>{benefits.counts?.earned||0}</strong><span>Earned</span></div>
        <div className="portal-summary-tile"><strong>{benefits.counts?.paid||0}</strong><span>Paid</span></div>
        <div className="portal-summary-tile"><strong>{benefits.counts?.expired||0}</strong><span>Expired</span></div>
      </div>
    </section>
    <section className="portal-card"><h2>Programs</h2>
      {(benefits.programs||[]).length===0?<p>No provider incentive programs are currently published.</p>:
      (benefits.programs||[]).map(p=><article key={p.programKey} className="portal-list-item"><strong>{p.name}</strong><p>Status: {p.status}{p.claimable?' · Active & claimable':' · Not currently claimable'}</p><p>{p.terms}</p><small>Reward: {p.rewardType==='FIXED_AMOUNT'?money(p.rewardValue):(p.rewardValue??'Not set')} · Qualifying event: {p.qualificationEvent}</small></article>)}
    </section>
    <section className="portal-card"><h2>Your referral rewards</h2>
      {(benefits.rewards||[]).length===0?<p>No referral rewards recorded yet.</p>:
      (benefits.rewards||[]).map(r=><article key={r.referralId} className="portal-list-item"><strong>{r.status}</strong><p>{r.rewardType} · {money(r.rewardAmount)}</p></article>)}
    </section>
  </main>;
}