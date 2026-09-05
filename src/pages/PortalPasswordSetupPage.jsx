import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import './PortalAccessPage.css';

const OWNER_EMAIL = 'vendors@danideclares.com';

export default function PortalPasswordSetupPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      if (!user || String(user.email || '').toLowerCase() !== OWNER_EMAIL) {
        navigate('/portal/login', { replace: true });
        return;
      }
      setSession(data.session);
    });
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!session) return setError('Your session is no longer active. Please access the portal again.');
    if (password.length < 12) return setError('Use a password with at least 12 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setBusy(false);
      setError(updateError.message);
      return;
    }
    navigate('/portal', { replace: true });
  };

  return (
    <main className="portal-access">
      <div className="portal-form-card portal-login-card">
        <p className="portal-kicker">DANI DECLARES</p>
        <h1>Set your private password</h1>
        <p>Your initial access password is temporary. Choose a private password before entering Owner Operations.</p>
        <form onSubmit={submit}>
          <label>New password<input type="password" minLength="12" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></label>
          <label>Confirm password<input type="password" minLength="12" required value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" /></label>
          {error && <div className="portal-error">{error}</div>}
          <button className="portal-primary portal-submit" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
        </form>
        <p className="portal-privacy">Use a password you do not use for another account. DANI DECLARES will never display your password to staff or customers.</p>
      </div>
    </main>
  );
}
