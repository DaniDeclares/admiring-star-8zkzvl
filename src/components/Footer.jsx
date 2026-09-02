import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const columns=[
  {title:'Services',links:[['Browse All Services','/catalog'],['Resident Services','/catalog?audience=residents'],['Property Operations','/services/property'],['Business Services','/services/business-solutions'],['Events & Experiences','/services/events']]},
  {title:'Who We Serve',links:[['Residents','/catalog?audience=residents'],['Property Managers','/services/property'],['Real Estate Professionals','/real-estate'],['Businesses','/services/business-solutions'],['Government & Institutions','/industries/government']]},
  {title:'Company',links:[['About','/about'],['Contact','/contact'],['Request Service','/request-service'],['Privacy','/privacy'],['Terms','/terms']]}
];

export default function Footer(){return <footer className="dd-site-footer"><div className="dd-footer-inner"><div className="dd-footer-brand-block"><img src="/logo-script.png" alt="DANI DECLARES LLC" className="dd-footer-logo"/><p>Operations • Execution • Support</p><p className="dd-footer-service-area">Serving Georgia.</p><div className="dd-footer-contact"><a href="tel:+14704857173">(470) 485-7173</a><a href="mailto:admin@danideclares.com">admin@danideclares.com</a></div></div><div className="dd-footer-grid">{columns.map(column=><div className="dd-footer-column" key={column.title}><h3>{column.title}</h3>{column.links.map(([label,path])=><Link key={label} to={path}>{label}</Link>)}</div>)}</div><div className="dd-footer-bottom"><span>© {new Date().getFullYear()} DANI DECLARES LLC</span><span>Professional support for the work that keeps life, property, business and events moving.</span></div></div></footer>}
