import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import './PortalAccessPage.css';

export default function PortalLoginPage(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const navigate=useNavigate();
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(data.session)navigate('/portal', {replace:true});});},[navigate]);
 const submit=async e=>{e.preventDefault();setBusy(true);setError('');const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error){setError(error.message);setBusy(false);return;}navigate('/portal',{replace:true});};
 return <main className="portal-access"><div className="portal-form-card portal-login-card"><p className="portal-kicker">DANI DECLARES</p><h1>Sign in to your workspace</h1><p>Customers, partners, providers and DANI DECLARES operations each see the information and actions their permissions allow.</p><form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<div className="portal-error">{error}</div>}<button className="portal-primary portal-submit" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form><p className="portal-existing">Need an account? <Link to="/portal/access">Create one</Link></p><p className="portal-existing"><Link to="/">Return to DANI DECLARES</Link></p></div></main>;
}
