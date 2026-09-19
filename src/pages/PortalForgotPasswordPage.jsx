import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import { SITE_URL } from '../data/siteConfig.js';
import './PortalAccessPage.css';

export default function PortalForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${SITE_URL}/portal/reset-password`,
    });
    setBusy(false);
    // Show the same outcome regardless of whether the email has an account --
    // Supabase's own anti-enumeration design means a different message here
    // would leak which emails are registered.
    if (resetError) setError(resetError.message);
    else setDone(true);
  };

  if (done) return <main className="portal-access"><div className="portal-success-card"><p className="portal-kicker">CHECK YOUR EMAIL</p><h1>Password reset link sent</h1><p>If an account exists for {email}, a password reset link has been sent. Follow the link to set a new password.</p><div className="portal-success-actions"><Link className="portal-primary" to="/portal/login">Return to sign in</Link></div></div></main>;

  return <main className="portal-access"><div className="portal-form-card portal-login-card"><p className="portal-kicker">DANI DECLARES</p><h1>Reset your password</h1><p>Enter the email on your account and we'll send you a link to set a new password.</p><form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>{error && <div className="portal-error" role="alert">{error}</div>}<button className="portal-primary portal-submit" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button></form><p className="portal-existing"><Link to="/portal/login">Back to sign in</Link></p></div></main>;
}
