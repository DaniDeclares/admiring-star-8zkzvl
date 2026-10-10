import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/portal', label: 'Home', locked: false, needsAgreement: false },
  { to: '/portal/field', label: 'Work', locked: true, needsAgreement: true },
  { to: '/portal/assignments', label: 'Offers', locked: true, needsAgreement: true },
  { to: '/portal/checklist', label: 'Tasks', locked: true, needsAgreement: true },
  { to: '/portal/payouts', label: 'Earnings', locked: true, needsAgreement: true },
  { to: '/portal/provider-agreement', label: 'Agreement', locked: false, needsAgreement: false },
  { to: '/portal/vendor-onboarding', label: 'Documents', locked: false, needsAgreement: true },
  { to: '/portal/w9', label: 'Tax Form (W-9)', locked: false, needsAgreement: true },
  { to: '/portal/profile', label: 'Profile', locked: false, needsAgreement: true },
  { to: '/portal/services', label: 'My Services', locked: false, needsAgreement: true },
  { to: '/portal/schedule', label: 'Schedule', locked: true, needsAgreement: true },
  { to: '/portal/evidence', label: 'Evidence', locked: true, needsAgreement: true },
  { to: '/portal/messages', label: 'Messages', locked: true, needsAgreement: true },
  { to: '/portal/settings', label: 'Notifications', locked: false, needsAgreement: true },
];

export default function ProviderNav({ isApprovedProvider, agreementSigned, showAccounting = false }) {
  const location = useLocation();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    const manifest = document.querySelector('link[rel="manifest"]');
    if (manifest) manifest.setAttribute('href', '/manifest-worker.json');
    document.title = 'DANI Worker App';
  }, []);
  useEffect(() => {
    const updateStandalone = () => setStandalone(window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true);
    const capture = event => { event.preventDefault(); setInstallPrompt(event); };
    updateStandalone();
    window.addEventListener('beforeinstallprompt', capture);
    window.addEventListener('appinstalled', updateStandalone);
    return () => { window.removeEventListener('beforeinstallprompt', capture); window.removeEventListener('appinstalled', updateStandalone); };
  }, []);
  const install = async () => {
    if (installPrompt) { await installPrompt.prompt(); await installPrompt.userChoice; setInstallPrompt(null); return; }
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    window.alert(isiOS ? 'On iPhone/iPad: tap Share, then “Add to Home Screen,” then Add.' : 'Open your browser menu and choose “Install app” or “Add to Home screen.”');
  };
  const tabs = showAccounting ? [...TABS.slice(0, 5), { to: '/portal/accounting', label: 'Financial Ops', locked: true, needsAgreement: true }, ...TABS.slice(5)] : TABS;
  const onboardingTabs = tabs.filter(tab => !tab.locked);
  const workTabs = tabs.filter(tab => tab.locked);
  const renderTab = tab => {
    const active = location.pathname === tab.to;
    const lockedForAgreement = tab.needsAgreement && !agreementSigned;
    const lockedForApproval = tab.locked && !isApprovedProvider;
    const showLock = lockedForAgreement || lockedForApproval;
    const lockTitle = lockedForAgreement ? 'Available after you sign the Provider Agreement' : 'Available after your application is approved';
    return <Link key={tab.to} to={tab.to} title={showLock ? lockTitle : undefined} aria-current={active ? 'page' : undefined} className={`portal-tab${active ? ' active' : ''}${showLock ? ' locked' : ''}`}>{tab.label}{showLock && <span className="portal-tab-lock" aria-label={lockTitle}>🔒</span>}</Link>;
  };
  return <div className="provider-navigation">
    <nav className="provider-onboarding-nav" aria-label="Provider onboarding">
      <div className="provider-nav-heading"><span>YOUR ONBOARDING</span><small>{agreementSigned ? 'Complete your application' : 'Begin with the agreement'}</small></div>
      <div className="portal-tabs">{onboardingTabs.map(renderTab)}</div>
    </nav>
    {isApprovedProvider ? <nav aria-label="Provider work tools" className="provider-work-nav">
      <div className="provider-nav-heading"><span>WORKSPACE</span><small>Approved provider tools</small></div>
      <div className="portal-tabs">{workTabs.map(renderTab)}</div>
    </nav> : <details className="provider-work-preview">
      <summary>Work tools <span>Available after approval</span></summary>
      <div className="provider-work-preview-body">
        <p>Your application must be reviewed before jobs, earnings, messages and field tools are available.</p>
        <nav className="portal-tabs" aria-label="Work tools unavailable until approval">{workTabs.map(renderTab)}</nav>
      </div>
    </details>}
    {!standalone && <button type="button" className="portal-install-app" onClick={install}>Install Worker App</button>}
  </div>;
}
