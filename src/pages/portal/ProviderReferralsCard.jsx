import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from './providerWorkspaceShared.jsx';

export default function ProviderReferralsCard({ referral }) {
  const location = useLocation();
  const section = useRef(null);
  const [copyMessage, setCopyMessage] = useState('');
  useEffect(() => {
    if (location.hash === '#referrals') section.current?.scrollIntoView?.({ block: 'start' });
  }, [location.hash]);
  useEffect(() => { setCopyMessage(''); }, [referral?.shareUrl]);
  const available = referral?.status === 'AVAILABLE';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referral.shareUrl);
      setCopyMessage('Link copied.');
    } catch (_error) { setCopyMessage('Copy was unavailable. Select and copy the link below.'); }
  };
  return <div id="referrals" ref={section}>
    <Card title="Referrals">
      <p className="portal-note">Your customer link records where an inquiry came from. Sharing it does not guarantee an assignment or a cash reward. Payment for service work or sales must be agreed separately.</p>
      {available ? <>
        <p><strong>Your referral code:</strong> {referral.code}</p>
        <label htmlFor="provider-referral-link">Your customer inquiry link</label>
        <input id="provider-referral-link" type="text" readOnly value={referral.shareUrl}
          onFocus={event => event.target.select()} style={{ width: '100%', marginTop: 8 }} />
        <div className="portal-actions" style={{ marginTop: 12 }}>
          <button type="button" className="portal-primary" onClick={copy}>Copy link</button>
        </div>
        <p role="status" aria-live="polite">{copyMessage}</p>
        <p><strong>Attributed inquiries:</strong> {Number.isInteger(referral.attributedInquiries) ? referral.attributedInquiries : 'Not available'}</p>
        <p className="portal-note">Inquiry attribution is not proof of a booking, collected payment, provider assignment or earned compensation.</p>
        {referral.terms && <p className="portal-note">{referral.terms}</p>}
      </> : <p role="status">{referral?.status === 'NOT_ISSUED'
        ? 'A customer referral link has not been issued for this provider. Contact DANI DECLARES to review it.'
        : referral?.status === 'NOT_AVAILABLE'
          ? 'A customer referral link is not available for this account.'
          : 'Referral information could not be loaded. Use Refresh or contact DANI DECLARES.'}</p>}
    </Card>
  </div>;
}
