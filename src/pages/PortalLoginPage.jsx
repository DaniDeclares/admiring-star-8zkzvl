import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import { completeStagedOnboarding } from '../lib/pendingOnboarding.js';
import './PortalAccessPage.css';

const OWNER_EMAIL = 'vendors@danideclares.com';
const STAFF_APP_ROLES = new Set(['admin', 'owner', 'staff_admin', 'staff']);
const OWNER_GOVERNED_ROLES = new Set(['OWNER_OPERATOR']);

async function resolvePortalDestination(user) {
 const appRole = user?.app_metadata?.portal_role || user?.app_metadata?.role;
 if (STAFF_APP_ROLES.has(appRole)) return '/portal/hq';

 const { data: governedRoles, error: governedRoleError } = await supabase.rpc('dd_get_my_portal_roles');
 if (!governedRoleError && Array.isArray(governedRoles) && governedRoles.some(row =>
   OWNER_GOVERNED_ROLES.has(row?.role || row?.portal_role || row)
 )) return '/portal/hq';

 const { data: identity, error: identityError } = await supabase
   .from('dd_portal_identities')
   .select('portal_role,is_active')
   .eq('auth_user_id', user.id)
   .eq('is_active', true)
   .maybeSingle();

 if (!identityError && identity?.portal_role === 'provider') return '/portal';
 return '/portal';
}

export default function PortalLoginPage(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const navigate=useNavigate();
 useEffect(()=>{
   let mounted = true;
   const intakeStagingId = new URLSearchParams(window.location.search).get('intake');
   const routeAuthenticatedUser = async (session) => {
     if (!session?.user) return;
     const result = await completeStagedOnboarding(supabase, session, intakeStagingId);
     if (result.attempted && !result.success) { if (mounted) { setError(result.error); setBusy(false); } return; }
     const normalized = (session.user.email || '').trim().toLowerCase();
     const needsPasswordChange = normalized === OWNER_EMAIL && !session.user.user_metadata?.password_changed_at;
     if (needsPasswordChange) {
       navigate('/portal/change-password', {replace:true});
       return;
     }
     const destination = await resolvePortalDestination(session.user);
     if (mounted) navigate(destination, {replace:true});
   };
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
 const submit=async e=>{e.preventDefault();setBusy(true);setError('');const normalized=email.trim().toLowerCase();const {error}=await supabase.auth.signInWithPassword({email:normalized,password});if(error){setError(error.message);setBusy(false);return;}};
 return <main className="portal-access"><div className="portal-form-card portal-login-card"><p className="portal-kicker">DANI DECLARES</p><h1>Access your DANI DECLARES account</h1><p>Customers, partners, providers and DANI DECLARES operations each see the information and actions their permissions allow.</p>{busy&&<div className="portal-success" role="status">Completing secure sign-in…</div>}<form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>{error&&<div className="portal-error" role="alert">{error}</div>}<button type="submit" className="portal-primary portal-submit" disabled={busy}>{busy?'Continuing…':'Continue'}</button></form><p className="portal-existing"><Link to="/portal/forgot-password">Forgot password?</Link></p><p className="portal-existing">New to DANI DECLARES? <Link to="/portal/access">Get started</Link></p><p className="portal-existing"><Link to="/">Return to DANI DECLARES</Link></p></div></main>;
}
