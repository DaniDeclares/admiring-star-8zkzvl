import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import './PortalAccessPage.css';

export default function PortalLoginPage(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const navigate=useNavigate();
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(data.session)navigate('/portal',{replace:true});});},[navigate]);
 const submit=async e=>{e.preventDefault();setBusy(true);setError('');const normalized=email.trim().toLowerCase();const {data,error}=await supabase.auth.signInWithPassword({email:normalized,password});if(error){setError(error.message);setBusy(false);return;}navigate(normalized==='vendors@danideclares.com'?'/portal/change-password':'/portal',{replace:true});};
 return <main className="portal-access"><div className="portal-form-card portal-login-card"><p className="portal-kicker">DANI DECLARES</p><h1>Access your DANI DECLARES account</h1><p>Customers, partners, providers and DANI DECLARES operations each see the information and actions their permissions allow.</p><form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<div className="portal-error">{error}</div>}<button className="portal-primary portal-submit" disabled={busy}>{busy?'Continuing…':'Continue'}</button></form><p className="portal-existing">New to DANI DECLARES? <Link to="/portal/access">Get started</Link></p><p className="portal-existing"><Link to="/">Return to DANI DECLARES</Link></p></div></main>;
}
