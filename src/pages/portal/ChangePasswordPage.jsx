import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import '../PortalAccessPage.css';

export default function ChangePasswordPage(){
  const [session,setSession]=useState(null); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState('');
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [done,setDone]=useState(false); const navigate=useNavigate();
  useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(!data.session) navigate('/portal/login',{replace:true}); else setSession(data.session);});},[navigate]);
  const submit=async e=>{e.preventDefault();setError('');
    if(password.length<12)return setError('Use a password with at least 12 characters.');
    if(password!==confirm)return setError('Passwords do not match.');
    setBusy(true); const {error}=await supabase.auth.updateUser({password});
    if(error){setError(error.message);setBusy(false);return;} setDone(true);setBusy(false);
  };
  if(!session)return <main className="portal-access"><div className="portal-form-card portal-login-card"><p className="portal-kicker">DANI DECLARES</p><h1>Preparing your account</h1><p>Please wait.</p></div></main>;
  if(done)return <main className="portal-access"><div className="portal-success-card"><p className="portal-kicker">PASSWORD UPDATED</p><h1>Your password has been changed.</h1><p>Your DANI DECLARES account is ready to use.</p><div className="portal-success-actions"><Link className="portal-primary" to="/portal">Continue to your portal</Link></div></div></main>;
  return <main className="portal-access"><div className="portal-form-card portal-login-card"><p className="portal-kicker">SECURE YOUR ACCOUNT</p><h1>Choose your password</h1><p>For security, set a private password you will use for your DANI DECLARES account.</p><form onSubmit={submit}><label>New password<input type="password" required minLength="12" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/></label><label>Confirm new password<input type="password" required minLength="12" value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password"/></label>{error&&<div className="portal-error">{error}</div>}<button className="portal-primary portal-submit" disabled={busy}>{busy?'Updating…':'Save password'}</button></form></div></main>;
}
