import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import './Navbar.css';

// Keep the public navigation centered on the customer's decision: what they
// need, who DANI serves, and how to start. Legacy/SEO routes remain available
// without competing for space in the primary navigation.
const groups = [
  { key:'residents', label:'Residents', links:[['Resident Services','/catalog?audience=residents'],['Memberships & Packages','/membership']] },
  { key:'property', label:'Property Management', links:[['Property Operations','/services/property'],['Resident Support','/catalog?audience=property']] },
  { key:'real-estate', label:'Real Estate', links:[['Real Estate Services','/real-estate'],['Listing & Field Support','/catalog?audience=real-estate']] },
  { key:'business', label:'Businesses', links:[['Business Services','/services/business-solutions'],['Print, Branding & Merch','/services/print-studio']] },
  { key:'government', label:'Government', links:[['Government & Institutional','/industries/government'],['Facilities & Administrative Support','/catalog?audience=government']] },
];

export default function Navbar() {
  const [whoWeServeOpen,setWhoWeServeOpen]=useState(false); const [mobileOpen,setMobileOpen]=useState(false); const closeAll=()=>{setWhoWeServeOpen(false);setMobileOpen(false)};
  const [session,setSession]=useState(null);
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const {data:listener}=supabase.auth.onAuthStateChange((_event,newSession)=>setSession(newSession));
    return ()=>{listener?.subscription?.unsubscribe();};
  },[]);
  const signOut=async()=>{closeAll();await supabase.auth.signOut();window.location.href='/';};
  return <header className="dd-navbar-header"><div className="dd-navbar-container">
    <Link to="/" className="dd-navbar-brand-logo" onClick={closeAll} aria-label="DANI DECLARES home"><img src="/logo-script.png" alt="DANI DECLARES LLC" className="dd-primary-logo" /></Link>
    <nav className="dd-navbar-nav desktop-only" aria-label="Primary navigation">
      <NavLink className="dd-top-link" to="/">Home</NavLink>
      <NavLink className="dd-top-link" to="/catalog">Services</NavLink>
      <div className="dd-nav-group">
        <button type="button" className={`dd-top-link dd-nav-trigger ${whoWeServeOpen?'is-open':''}`} onClick={()=>setWhoWeServeOpen(!whoWeServeOpen)} aria-expanded={whoWeServeOpen}>Who We Serve <span>▾</span></button>
        {whoWeServeOpen&&<div className="dd-mega-menu grouped">{groups.map(group=><div className="dd-mega-group" key={group.key}><p className="dd-mega-group-title">{group.label}</p>{group.links.map(([label,path])=><Link key={label} to={path} onClick={closeAll} className="dd-mega-link">{label}</Link>)}</div>)}</div>}
      </div>
      <NavLink className="dd-top-link" to="/about">About</NavLink>
      <NavLink className="dd-top-link" to="/contact">Contact</NavLink>
    </nav>
    <div className="dd-navbar-actions">{session?<><Link to="/portal" className="dd-top-link" onClick={closeAll}>My Dashboard</Link><button type="button" className="dd-top-link" onClick={signOut}>Sign Out</button></>:<Link to="/portal/login" className="dd-top-link" onClick={closeAll}>Sign In</Link>}<Link to="/request-service" className="dd-project-cta" onClick={closeAll}>Request Service</Link><button type="button" className="dd-mobile-toggle" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen?'✕':'☰'}</button></div>
  </div>{mobileOpen&&<div className="dd-mobile-menu"><Link to="/" onClick={closeAll} className="dd-mobile-home">Home</Link><Link to="/catalog" onClick={closeAll} className="dd-mobile-home">Services</Link><div className="dd-mobile-group-title dd-mobile-section-heading">Who We Serve</div>{groups.map(group=><div className="dd-mobile-group" key={group.key}><div className="dd-mobile-group-title">{group.label}</div>{group.links.map(([label,path])=><Link key={label} to={path} onClick={closeAll}>{label}</Link>)}</div>)}<Link to="/about" onClick={closeAll} className="dd-mobile-home">About</Link><Link to="/contact" onClick={closeAll} className="dd-mobile-home">Contact</Link>{session?<><Link to="/portal" onClick={closeAll} className="dd-mobile-home">My Dashboard</Link><button type="button" onClick={signOut} className="dd-mobile-home">Sign Out</button></>:<Link to="/portal/login" onClick={closeAll} className="dd-mobile-home">Sign In</Link>}<Link to="/request-service" onClick={closeAll} className="dd-mobile-project-cta">Request Service</Link></div>}</header>;
}
