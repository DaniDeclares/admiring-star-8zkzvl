import React, { useEffect, useState } from 'react';
import { detectInAppBrowser } from '../lib/inAppBrowserDetection.js';
import { capture } from '../lib/posthogAnalytics.js';
import './InAppBrowserBanner.css';

const DISMISS_KEY_PREFIX = 'dd_iab_banner_dismissed_';

export default function InAppBrowserBanner() {
  const [app, setApp] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const detected = detectInAppBrowser();
    if (!detected) return;
    let alreadyDismissed = false;
    try {
      alreadyDismissed = window.sessionStorage.getItem(DISMISS_KEY_PREFIX + detected.id) === '1';
    } catch (_) { /* sessionStorage unavailable (private mode, sandboxed webview) -- show the banner anyway */ }
    if (alreadyDismissed) return;
    setApp(detected);
    capture('in_app_browser_detected', { app: detected.id });
  }, []);

  if (!app) return null;

  const dismiss = () => {
    try { window.sessionStorage.setItem(DISMISS_KEY_PREFIX + app.id, '1'); } catch (_) { /* best effort */ }
    setApp(null);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch (_) { /* clipboard API unavailable -- the link is still shown in the address bar for manual copy */ }
  };

  return (
    <div className="iab-banner" role="alert">
      <div className="iab-banner-content">
        <span className="iab-banner-text">
          You're browsing inside the {app.label} app. Signing up or confirming your email may not
          work here — please open this page in Safari or Chrome to continue.
        </span>
        <span className="iab-banner-actions">
          <button type="button" className="iab-banner-copy" onClick={copyLink}>
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <button type="button" className="iab-banner-dismiss" onClick={dismiss} aria-label="Dismiss">×</button>
        </span>
      </div>
    </div>
  );
}
