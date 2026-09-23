import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const TABS=[
 {to:'/portal',label:'Home'},
 {to:'/request-service',label:'Book Service'},
 {to:'/portal/customer/orders',label:'My Services'},
 {to:'/portal/customer/messages',label:'Messages'},
 {to:'/portal/customer/payments',label:'Payments'},
 {to:'/portal/settings',label:'Notifications'},
];
export default function CustomerNav(){
 const location=useLocation(); const [installPrompt,setInstallPrompt]=useState(null); const [standalone,setStandalone]=useState(false);
 useEffect(()=>{const manifest=document.querySelector('link[rel="manifest"]');if(manifest)manifest.setAttribute('href','/manifest-customer.json');document.title='DANI Customer App';},[]);
 useEffect(()=>{const update=()=>setStandalone(window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true);const capture=e=>{e.preventDefault();setInstallPrompt(e)};update();window.addEventListener('beforeinstallprompt',capture);window.addEventListener('appinstalled',update);return()=>{window.removeEventListener('beforeinstallprompt',capture);window.removeEventListener('appinstalled',update)}},[]);
 const install=async()=>{if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;setInstallPrompt(null);return;}const isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent);window.alert(isiOS?'On iPhone/iPad: tap Share, then “Add to Home Screen,” then Add.':'Open your browser menu and choose “Install app” or “Add to Home screen.”')};
 return <><nav className="portal-tabs">{TABS.map(tab=><Link key={tab.to} to={tab.to} className={`portal-tab${location.pathname===tab.to?' active':''}`}>{tab.label}</Link>)}</nav>{!standalone&&<button type="button" className="portal-install-app" onClick={install}>Install Customer App</button>}</>;
}
