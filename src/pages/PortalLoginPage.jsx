import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import './PortalAccessPage.css';

const OWNER_EMAIL = 'vendors@danideclares.com';

export default function PortalLoginPage(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const navigate=useNavigate();
 const routeAuthenticatedUser = async (session) => {
   if (!session?.user) return false;
   const normalized = (session.user.email || '').trim().toLowerCase();
   if (normalized === OWNER_EMAIL) { navigate('/portal/change-password', {replace:true}); return true; }
   navigate('/portal', {replace:true}); return true;
 };
 useEffect(()=>{
   let mounted = true;
   const finishAuth = async () => {
     try {
       const params = new URLSearchParams(window.location.search);
       const code = params.get('code');
       if (code) {
         setBusy(true);
         const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
         if (exchangeError) { if (mounted) setError('This sign-in link could not be completed. Please request a new sign-in link.'); setBusy(false); return; }
         window.history.replaceState({}, document.title, window.location.pathname);
       }
       const { data, error:sessionError } = await supabase.auth.getSession();
       if (sessionError) throw sessionError;
       if (data.session) await routeAuthenticatedUser(data.session);
     } catch (e) {
       if (mounted) setError('We could not complete sign-in. Please request a new sign-in link or use your password.');
     } finally { if (mounted) setBusy(false); }
   };
   const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
     if (session) routeAuthenticatedUser(session);
   });
   finishAuth();
   return () => { mounted = false; listener?.subscription?.unsubscribe(); };
 },[navigate]);
 const submit=async e=>{e.preventDefault();setBusy(true);setError('');const normalized=email.trim().toLowerCase();const {error}=await supabase.auth.signInWithPassword({email:normalized,password});if(error){setError(error.message);setBusy(false);return;}navigate(normalized===OWNER_EMAIL?'/portal/change-password':'/portal',{replace:true});};
 return <main className="portal-access"><div className="portal-form-card portal-login-card"><p className="portal-kicker">DANI DECLARES</p><h1>Access your DANI DECLARES account</h1><p>Customers, partners, providers and DANI DECLARES operations each see the information and actions their permissions allow.</p>{busy&&<div className="portal-success" role="status">Completing secure sign-in…</div>}<form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>{error&&<div className="portal-error" role="alert">{error}</div>}<button className="portal-primary portal-submit" disabled={busy}>{busy?'Continuing…':'Continue'}</button></form><p className="portal-existing">New to DANI DECLARES? <Link to="/portal/access">Get started</Link></p><p className="portal-existing"><Link to="/">Return to DANI DECLARES</Link></p></div></main>;
}
