import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import { completeStagedOnboarding, detachStagedOnboarding } from '../lib/pendingOnboarding.js';
import './PortalAccessPage.css';

const OWNER_EMAIL = 'vendors@danideclares.com';
const STAFF_APP_ROLES = new Set(['admin', 'owner', 'staff_admin', 'staff']);
const OWNER_GOVERNED_ROLES = new Set(['OWNER_OPERATOR']);
async function boundedAuth(operation, label, ms=12000) {
 let timer;
 try {
   return await Promise.race([operation,new Promise((_,reject)=>{
     timer=window.setTimeout(()=>reject(new Error(label)),ms);
   })]);
 } finally { window.clearTimeout(timer); }
}

async function resolvePortalDestination(user) {
 const appRole = user?.app_metadata?.portal_role || user?.app_metadata?.role;
 if (STAFF_APP_ROLES.has(appRole)) return '/portal/hq';

 const { data: governedRoles, error: governedRoleError } = await boundedAuth(supabase.rpc('dd_get_my_portal_roles'),'Role verification took too long. Please retry sign-in.');
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
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [showPassword,setShowPassword]=useState(false);
 const navigate=useNavigate();
 const routeRef=useRef(null);
 const requestedRole=new URLSearchParams(window.location.search).get('role');
 const loginAudience=requestedRole==='provider'?'provider':'customer';

 useEffect(()=>{
   let mounted=true;
   let routingPromise=null;
   const intakeStagingId=new URLSearchParams(window.location.search).get('intake');
   const routeAuthenticatedUser=(session)=>{
     if(!session?.user)return Promise.resolve();
     if(routingPromise)return routingPromise;
     routingPromise=(async()=>{
       // Provider staged onboarding is preserved, but owner HQ login
       // must never block on unrelated provider intake fallback processing.
       const role=session.user.app_metadata?.portal_role||session.user.app_metadata?.role;
       const isKnownStaff=STAFF_APP_ROLES.has(role);
       const isKnownOwnerEmail=(session.user.email||'').trim().toLowerCase()===OWNER_EMAIL;
       if(!isKnownStaff&&!isKnownOwnerEmail){
         const onboardingOperation=completeStagedOnboarding(supabase,session,intakeStagingId);
         let result;
         try{
           result=await boundedAuth(onboardingOperation,'Portal setup timed out. Please retry sign-in.');
         }catch(onboardingError){
           detachStagedOnboarding(onboardingOperation);
           throw onboardingError;
         }
         if(result.attempted&&!result.success)throw new Error(result.error||'Portal setup could not complete.');
       }
       const needsPasswordChange=isKnownOwnerEmail&&!session.user.user_metadata?.password_changed_at;
       if(needsPasswordChange){if(mounted)navigate('/portal/change-password',{replace:true});return;}
       const destination=await boundedAuth(resolvePortalDestination(session.user),'Portal role verification timed out. Please retry sign-in.');
       if(mounted)navigate(destination,{replace:true});
     })().catch(e=>{
       if(mounted)setError(e?.message||'Signed in, but your workspace could not be opened. Please retry.');
     }).finally(()=>{
       if(mounted)setBusy(false);
       routingPromise=null;
     });
     return routingPromise;
   };
   routeRef.current=routeAuthenticatedUser;
   const finishAuth=async()=>{
     try{
       const params=new URLSearchParams(window.location.search);
       const code=params.get('code');
       if(code){
         if(mounted)setBusy(true);
         const {error:exchangeError}=await boundedAuth(supabase.auth.exchangeCodeForSession(code),'Sign-in link timed out. Please retry.');
         if(exchangeError)throw new Error('This sign-in link could not be completed. Request a new link.');
         window.history.replaceState({},document.title,window.location.pathname);
       }
       const {data,error:sessionError}=await boundedAuth(supabase.auth.getSession(),'Session check timed out. Please retry.');
       if(sessionError)throw sessionError;
       if(data?.session)await routeAuthenticatedUser(data.session);
     }catch(e){if(mounted)setError(e?.message||'Could not complete sign-in. Please retry.');}
     finally{if(mounted)setBusy(false);}
   };
   // Never perform async Supabase queries synchronously inside auth
   // callbacks: auth-client locks can otherwise stall both login and logout.
   const {data:listener}=supabase.auth.onAuthStateChange((event,session)=>{
     if(event==='SIGNED_OUT')return;
     if(session)window.setTimeout(()=>{
       if(mounted)void routeAuthenticatedUser(session);
     },0);
   });
   void finishAuth();
   return ()=>{mounted=false;routeRef.current=null;listener?.subscription?.unsubscribe();};
 },[navigate]);
 const submit=async e=>{
   e.preventDefault();
   if(busy)return;
   setBusy(true);setError('');
   try{
     const normalized=email.trim().toLowerCase();
     const {data,error:authError}=await boundedAuth(
       supabase.auth.signInWithPassword({email:normalized,password}),
       'Authentication timed out. Please try again.');
     if(authError)throw authError;
     if(!data?.session)throw new Error('Sign-in did not return an active session. Please retry.');
     // Successful password authentication must route directly, not depend
     // exclusively on whether the SIGNED_IN event fires.
     if(routeRef.current)await routeRef.current(data.session);
     else navigate('/portal',{replace:true});
   }catch(e){setError(e?.message||'Sign-in failed. Please retry.');setBusy(false);}
 };
 return <main className="portal-access"><div className="portal-form-card portal-login-card"><p className="portal-kicker">DANI DECLARES</p><h1>{loginAudience === 'provider' ? 'Provider sign in' : 'Customer sign in'}</h1><p>{loginAudience === 'provider' ? 'Sign in to your DANI DECLARES Provider workspace for assignments, scheduling, checklists, evidence and payouts.' : 'Sign in to your DANI DECLARES workspace for requests, quotes, appointments, payments and service history.'}</p>{busy&&<div className="portal-success" role="status">Completing secure sign-in…</div>}<form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><label>Password<input type={showPassword ? "text" : "password"} required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label><label style={{display:"flex",alignItems:"center",gap:8,fontSize:14}}><input type="checkbox" checked={showPassword} onChange={e=>setShowPassword(e.target.checked)} /> Show password</label>{error&&<div className="portal-error" role="alert">{error}</div>}<button type="submit" className="portal-primary portal-submit" disabled={busy}>{busy?'Continuing…':'Continue'}</button></form><p className="portal-existing"><Link to="/portal/forgot-password">Forgot password?</Link></p><p className="portal-existing">{loginAudience === "provider" ? <>Need a provider account? <Link to="/portal/access?role=provider">Apply / create account</Link></> : <>Need a customer account? <Link to="/portal/access">Create account</Link></>}</p><p className="portal-existing">{loginAudience === "provider" ? <>Customer instead? <Link to="/portal/login">Customer sign in</Link></> : <>Provider instead? <Link to="/portal/login?role=provider">Provider sign in</Link></>}</p><p className="portal-existing"><Link to="/">Return to DANI DECLARES</Link></p></div></main>;
}
