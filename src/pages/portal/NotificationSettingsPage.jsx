import React, { useEffect, useState } from 'react';
import { Card, useProviderWorkspace, AccountBadge } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

export default function NotificationSettingsPage() {
  const { session, snapshot, loading, error, message, load, act } = useProviderWorkspace();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsPhoneNumber, setSmsPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const prefs = snapshot?.notificationPreferences;
    if (!prefs) return;
    setEmailEnabled(prefs.email_enabled !== false);
    setSmsEnabled(Boolean(prefs.sms_enabled));
    setSmsPhoneNumber(prefs.sms_phone_number || '');
  }, [snapshot?.notificationPreferences]);

  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    if (smsEnabled && !smsPhoneNumber.trim()) { setFormError('Enter a phone number to receive text messages.'); return; }
    setSaving(true);
    await act('update_notification_preferences', { emailEnabled, smsEnabled, smsPhoneNumber: smsPhoneNumber.trim() || null });
    setSaving(false);
  };

  return <main className="portal-shell">
    <header className="portal-hero">
      <div><p className="portal-eyebrow">DANI DECLARES</p><h1>Notification settings</h1><p>Choose how you want to hear from DANI DECLARES — email, text message, or both.</p></div>
      <div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div>
    </header>
    {error && <div className="portal-alert" role="alert">{error}</div>}
    {message && <div className="portal-success" role="status">{message}</div>}
    {formError && <div className="portal-alert" role="alert">{formError}</div>}
    <Card title="Notification channels">
      <form onSubmit={save}>
        <label className="portal-row" style={{ alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={emailEnabled} onChange={e => setEmailEnabled(e.target.checked)} />
          <div><strong>Email</strong><small>Updates sent to the email on your account.</small></div>
        </label>
        <label className="portal-row" style={{ alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 12 }}>
          <input type="checkbox" checked={smsEnabled} onChange={e => setSmsEnabled(e.target.checked)} />
          <div><strong>Text message (SMS)</strong><small>Time-sensitive updates sent by text.</small></div>
        </label>
        {smsEnabled && <label style={{ display: 'block', marginTop: 12 }}>Phone number for text messages
          <input type="tel" value={smsPhoneNumber} onChange={e => setSmsPhoneNumber(e.target.value)} placeholder="(555) 555-5555" style={{ display: 'block', width: '100%', maxWidth: 320, marginTop: 6, padding: '10px 12px', borderRadius: 8 }} />
        </label>}
        <div className="portal-actions" style={{ marginTop: 16 }}>
          <button className="portal-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save preferences'}</button>
        </div>
      </form>
    </Card>
  </main>;
}
