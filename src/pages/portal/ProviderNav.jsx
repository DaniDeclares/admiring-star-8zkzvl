import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/portal', label: 'Overview', locked: false },
  { to: '/portal/assignments', label: 'Assignments', locked: true },
  { to: '/portal/schedule', label: 'Schedule', locked: true },
  { to: '/portal/checklist', label: 'Field Checklist', locked: true },
  { to: '/portal/evidence', label: 'Evidence', locked: true },
  { to: '/portal/payouts', label: 'Payouts', locked: true },
  { to: '/portal/vendor-onboarding', label: 'Documents', locked: false },
  { to: '/portal/profile', label: 'Profile', locked: false },
];

export default function ProviderNav({ isApprovedProvider }) {
  const location = useLocation();
  return <nav className="portal-tabs">{TABS.map(tab => {
    const active = location.pathname === tab.to;
    const showLock = tab.locked && !isApprovedProvider;
    return <Link key={tab.to} to={tab.to} className={`portal-tab${active ? ' active' : ''}${showLock ? ' locked' : ''}`}>{tab.label}{showLock && <span className="portal-tab-lock" title="Unlocks once your application is approved">🔒</span>}</Link>;
  })}</nav>;
}
