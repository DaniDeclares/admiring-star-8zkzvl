import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import './PortalAccessPage.css';

export default function PortalResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const finish = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (!data.session) setExpired(true);
        setReady(true);
      } catch (e) {
        if (!cancelled) { setExpired(true); setReady(true); }
      }
    };
    finish();
    return () => { cancelled = true; };
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (password.length < 8) return setError('Use a password with at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) return setError(updateError.message);
    setDone(true);
  };

  if (!ready) return <main className="portal-access"><div className="portal-success-card"><p className="portal-kicker">DANI DECLARES</p><h1>Verifying your reset link…</h1></div></main>;

  if (expired) return <main className="portal-access"><div className="portal-success-card"><p className="portal-kicker">LINK EXPIRED</p><h1>This reset link no longer works</h1><p>Password reset links expire after a short time, or may have already been used. Request a new one.</p><div className="portal-success-actions"><Link className="portal-primary" to="/portal/forgot-password">Request a new link</Link></div></div></main>;

  if (done) return <main className="portal-access"><div className="portal-success-card"><p className="portal-kicker">PASSWORD UPDATED</p><h1>Your password has been changed</h1><p>You can now sign in with your new password.</p><div className="portal-success-actions"><Link className="portal-primary" to="/portal/login">Sign in</Link></div></div></main>;

  return <main className="portal-access"><div className="portal-form-card portal-login-card"><p className="portal-kicker">DANI DECLARES</p><h1>Set a new password</h1><form onSubmit={submit}><label>New password<input type="password" minLength="8" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></label><label>Confirm new password<input type="password" minLength="8" required value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" /></label>{error && <div className="portal-error" role="alert">{error}</div>}<button className="portal-primary portal-submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button></form></div></main>;
}
