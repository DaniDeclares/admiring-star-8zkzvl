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

export default function ProviderNav({ isApprovedProvider, agreementSigned }) {
  const location = useLocation();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [standalone, setStandalone] = useState(false);
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
  return <><nav className="portal-tabs">{TABS.map(tab => {
    const active = location.pathname === tab.to;
    const lockedForAgreement = tab.needsAgreement && !agreementSigned;
    const lockedForApproval = tab.locked && !isApprovedProvider;
    const showLock = lockedForAgreement || lockedForApproval;
    const lockTitle = lockedForAgreement ? 'Unlocks once you sign the Provider Agreement' : 'Unlocks once your application is approved';
    return <Link key={tab.to} to={tab.to} className={`portal-tab${active ? ' active' : ''}${showLock ? ' locked' : ''}`}>{tab.label}{showLock && <span className="portal-tab-lock" title={lockTitle}>🔒</span>}</Link>;
  })}</nav>{!standalone && <button type="button" className="portal-install-app" onClick={install}>Install Worker App</button>}</>;
}
