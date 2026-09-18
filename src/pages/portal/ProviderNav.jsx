import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/portal', label: 'Overview', locked: false, needsAgreement: false },
  { to: '/portal/provider-agreement', label: 'Provider Agreement', locked: false, needsAgreement: false },
  { to: '/portal/vendor-onboarding', label: 'Documents', locked: false, needsAgreement: true },
  { to: '/portal/profile', label: 'Profile', locked: false, needsAgreement: true },
  { to: '/portal/assignments', label: 'Assignments', locked: true, needsAgreement: true },
  { to: '/portal/schedule', label: 'Schedule', locked: true, needsAgreement: true },
  { to: '/portal/checklist', label: 'Field Checklist', locked: true, needsAgreement: true },
  { to: '/portal/evidence', label: 'Evidence', locked: true, needsAgreement: true },
  { to: '/portal/payouts', label: 'Payouts', locked: true, needsAgreement: true },
  { to: '/portal/messages', label: 'Messages', locked: true, needsAgreement: true },
  { to: '/portal/settings', label: 'Notifications', locked: false, needsAgreement: true },
];

export default function ProviderNav({ isApprovedProvider, agreementSigned }) {
  const location = useLocation();
  return <nav className="portal-tabs">{TABS.map(tab => {
    const active = location.pathname === tab.to;
    const lockedForAgreement = tab.needsAgreement && !agreementSigned;
    const lockedForApproval = tab.locked && !isApprovedProvider;
    const showLock = lockedForAgreement || lockedForApproval;
    const lockTitle = lockedForAgreement ? 'Unlocks once you sign the Provider Agreement' : 'Unlocks once your application is approved';
    return <Link key={tab.to} to={tab.to} className={`portal-tab${active ? ' active' : ''}${showLock ? ' locked' : ''}`}>{tab.label}{showLock && <span className="portal-tab-lock" title={lockTitle}>🔒</span>}</Link>;
  })}</nav>;
}
