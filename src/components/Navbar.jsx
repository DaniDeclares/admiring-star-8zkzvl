import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

const groups = [
  { key:'residents', label:'Residents', links:[['Resident Services','/catalog?audience=residents'],['Memberships & Packages','/membership'],['Request Service','/request-service']] },
  { key:'property', label:'Property Management', links:[['Property Operations','/services/property'],['Resident Support','/catalog?audience=property'],['Request Property Support','/request-service']] },
  { key:'real-estate', label:'Real Estate', links:[['Real Estate Services','/real-estate'],['Listing & Field Support','/catalog?audience=real-estate'],['Request Support','/request-service']] },
  { key:'business', label:'Businesses', links:[['Business Services','/services/business-solutions'],['Print, Branding & Merch','/services/print-studio'],['Request Business Support','/request-service']] },
  { key:'government', label:'Government', links:[['Government & Institutional','/industries/government'],['Facilities & Administrative Support','/catalog?audience=government'],['Procurement Intake','/request-service']] },
];

export default function Navbar() {
  const [openMenu,setOpenMenu]=useState(null); const [mobileOpen,setMobileOpen]=useState(false); const closeAll=()=>{setOpenMenu(null);setMobileOpen(false)};
  return <header className="dd-navbar-header"><div className="dd-navbar-container">
    <Link to="/" className="dd-navbar-brand-logo" onClick={closeAll} aria-label="DANI DECLARES home"><img src="/dani-declares-logo.svg" alt="DANI DECLARES LLC" className="dd-primary-logo" /></Link>
    <nav className="dd-navbar-nav desktop-only" aria-label="Primary navigation"><NavLink className="dd-top-link" to="/">Home</NavLink><NavLink className="dd-top-link" to="/catalog">Services</NavLink>{groups.map(group=><div className="dd-nav-group" key={group.key}><button type="button" className={`dd-top-link dd-nav-trigger ${openMenu===group.key?'is-open':''}`} onClick={()=>setOpenMenu(openMenu===group.key?null:group.key)} aria-expanded={openMenu===group.key}>{group.label} <span>▾</span></button>{openMenu===group.key&&<div className="dd-mega-menu single-column">{group.links.map(([label,path])=><Link key={label} to={path} onClick={closeAll} className="dd-mega-link">{label}</Link>)}</div>}</div>)}<NavLink className="dd-top-link" to="/about">About</NavLink><NavLink className="dd-top-link" to="/contact">Contact</NavLink></nav>
    <div className="dd-navbar-actions"><Link to="/portal/login" className="dd-top-link" onClick={closeAll}>Sign In</Link><Link to="/request-service" className="dd-project-cta" onClick={closeAll}>Book / Request</Link><button type="button" className="dd-mobile-toggle" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen?'✕':'☰'}</button></div>
  </div>{mobileOpen&&<div className="dd-mobile-menu"><Link to="/" onClick={closeAll} className="dd-mobile-home">Home</Link><Link to="/catalog" onClick={closeAll} className="dd-mobile-home">Services</Link>{groups.map(group=><div className="dd-mobile-group" key={group.key}><div className="dd-mobile-group-title">{group.label}</div>{group.links.map(([label,path])=><Link key={label} to={path} onClick={closeAll}>{label}</Link>)}</div>)}<Link to="/about" onClick={closeAll} className="dd-mobile-home">About</Link><Link to="/contact" onClick={closeAll} className="dd-mobile-home">Contact</Link><Link to="/portal/login" onClick={closeAll} className="dd-mobile-home">Sign In</Link><Link to="/portal/access" onClick={closeAll} className="dd-mobile-home">Create Portal Account</Link><Link to="/request-service" onClick={closeAll} className="dd-mobile-project-cta">Book / Request Service</Link></div>}</header>;
}
