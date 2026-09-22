/* eslint-disable */
import React from 'react';
import { Link } from 'react-router-dom';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';
import './PortalWorkspacePage.css';

const systems = [
  { key:'ASANA', name:'Asana', role:'Tasks & release execution', auth:'OAuth 2.0', callback:'https://danideclares.com/api/integrations/asana/callback', provider:'https://app.asana.com/0/my-apps' },
  { key:'NOTION', name:'Notion', role:'SOPs, manuals & institutional knowledge', auth:'Internal connection token (preferred for the DANI workspace) or public OAuth', callback:'https://danideclares.com/api/integrations/notion/callback', provider:'https://www.notion.so/my-integrations' },
  { key:'QUICKBOOKS_ONLINE', name:'QuickBooks Online', role:'Accounting authority', auth:'OAuth 2.0', callback:'https://danideclares.com/api/integrations/quickbooks/callback', provider:'https://developer.intuit.com/' },
  { key:'GMAIL', name:'Gmail', role:'Business communications rail', auth:'Google OAuth 2.0', callback:'https://danideclares.com/api/integrations/google/callback', provider:'https://mail.google.com/' },
  { key:'GOOGLE_CALENDAR', name:'Google Calendar', role:'Appointment projection & availability', auth:'Google OAuth 2.0', callback:'https://danideclares.com/api/integrations/google/callback', provider:'https://calendar.google.com/' },
  { key:'GOOGLE_DRIVE', name:'Google Drive', role:'Documents, evidence & Google-native files', auth:'Google OAuth 2.0', callback:'https://danideclares.com/api/integrations/google/callback', provider:'https://drive.google.com/' },
  { key:'HUBSPOT', name:'HubSpot', role:'CRM & marketing engagement', auth:'OAuth 2.0 / private app', callback:'https://danideclares.com/api/integrations/hubspot/callback', provider:'https://app.hubspot.com/' },
  { key:'AIRTABLE', name:'Airtable', role:'Planning, review & flexible workspaces', auth:'OAuth / scoped token', callback:'Production OAuth build required', provider:'https://airtable.com/' },
  { key:'GITHUB', name:'GitHub', role:'Application source & version authority', auth:'GitHub App / OAuth', callback:'Managed developer connection', provider:'https://github.com/DaniDeclares/admiring-star-8zkzvl' },
  { key:'VERCEL', name:'Vercel', role:'Deployment & runtime hosting authority', auth:'Vercel authorization', callback:'Managed deployment connection', provider:'https://vercel.com/' },
  { key:'POSTHOG', name:'PostHog', role:'Product analytics & observability', auth:'Project API credentials', callback:'Production credentials required', provider:'https://app.posthog.com/' },
  { key:'GOOGLE_VOICE', name:'Google Voice / 7173', role:'Current business calling surface', auth:'Supported web/app access; SIP Link only where eligible', callback:'Not applicable', provider:'https://voice.google.com/' },
];

function IntegrationCard({ system, state, env, session, onRefresh }) {
  const googleWorkspace = ['GMAIL','GOOGLE_CALENDAR','GOOGLE_DRIVE'].includes(system.key);
  const configured = googleWorkspace ? env.GOOGLE : system.key === 'ASANA'
    ? env.ASANA
    : system.key === 'NOTION'
      ? (env.NOTION_INTERNAL || env.NOTION_PUBLIC)
      : system.key === 'QUICKBOOKS_ONLINE'
        ? env.QUICKBOOKS
        : system.key === 'HUBSPOT'
          ? env.HUBSPOT
          : false;
  const managed = ['GITHUB','VERCEL'].includes(system.key);
  const externalOnly = ['AIRTABLE','POSTHOG'].includes(system.key);
  const connected = (state?.connections || []).some(c => c.adapter_code === system.key && c.connection_status === 'CONNECTED');
  const notionInternalHealthy = system.key === 'NOTION' && Boolean(state?.notionInternalValid);

  async function connect() {
    if (system.key === 'GOOGLE_VOICE') {
      window.open(system.provider, '_blank', 'noopener,noreferrer');
      return;
    }
    if (system.key === 'NOTION' && env.NOTION_INTERNAL) { await onRefresh(); return; }
    const endpoint = googleWorkspace
      ? '/api/integrations/google/start'
      : system.key === 'QUICKBOOKS_ONLINE'
      ? '/api/integrations/quickbooks/start'
      : system.key === 'NOTION'
        ? '/api/integrations/notion/start'
        : system.key === 'HUBSPOT'
          ? '/api/integrations/hubspot/start'
          : '/api/integrations/asana/start';
    const response = await fetch(endpoint, { headers:{ Authorization:'Bearer '+session.access_token } });
    const body = await response.json();
    if (!response.ok || !body.success || !body.authorization_url) throw new Error(body.error || 'Connection could not be started.');
    window.location.href = body.authorization_url;
  }

  return <div style={{border:'1px solid #e6d9c8',borderRadius:16,padding:18,background:'#fff'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'flex-start'}}>
      <strong style={{fontSize:18,color:'#6b1f2b'}}>{system.name}</strong>
      <span className='portal-pill'>{connected || notionInternalHealthy ? 'DANI CONNECTED' : managed ? 'MANAGED CONNECTION' : configured ? 'READY TO CONNECT' : externalOnly ? 'PRODUCTION OAUTH REQUIRED' : 'CREDENTIALS REQUIRED'}</span>
    </div>
    <p style={{fontSize:12,color:'#75696a',lineHeight:1.5}}><strong>DANI role:</strong> {system.role}</p>
    <p style={{fontSize:12,color:'#75696a',lineHeight:1.5}}><strong>Auth:</strong> {system.auth}</p>
    <p style={{fontSize:12,color:'#75696a',lineHeight:1.5,wordBreak:'break-word'}}><strong>Callback:</strong> {system.callback}</p>
    {!externalOnly && !managed && system.key !== 'GOOGLE_VOICE' && <button className='portal-primary' style={{border:0,cursor:'pointer'}} disabled={!configured} onClick={connect}>{system.key === 'NOTION' && env.NOTION_INTERNAL ? 'Validate token' : connected ? 'Reconnect' : 'Connect'} ↗</button>}
    {(externalOnly || managed || system.key === 'GOOGLE_VOICE') && <a className='portal-primary' href={system.provider} target='_blank' rel='noreferrer'>Open {system.name} ↗</a>}
    {externalOnly && <p className='portal-note' style={{marginTop:10}}>Available to ChatGPT does not mean the deployed DANI application has OAuth access. DANI will show this as connected only after its own server-side credentials and consent flow are configured.</p>}
    {(connected || notionInternalHealthy) && <p className='portal-note' style={{marginTop:10}}>{notionInternalHealthy && !connected ? 'The DANI Notion internal connection token is valid. Share the required parent pages/databases with that Notion connection before expecting page reads/writes.' : 'DANI has a stored, encrypted connection record. External IDs remain references; DANI retains its own runtime authority.'}</p>}
  </div>;
}

function IntegrationsCenterPage({ session }) {
 const [state,setState]=React.useState({env:{},connections:[]});
 const [loading,setLoading]=React.useState(true);
 const [error,setError]=React.useState('');
 const load=React.useCallback(async()=>{
  setLoading(true); setError('');
  try {
   const r=await fetch('/api/integrations/status',{headers:{Authorization:'Bearer '+session.access_token}});
   const d=await r.json(); if(!r.ok||!d.success)throw new Error(d.error||'Unable to load integration status.');
   setState(d);
  } catch(e){setError(e.message||'Unable to load integration status.');}
  finally{setLoading(false);}
 },[session.access_token]);
 React.useEffect(()=>{load();},[load]);

 const query = new URLSearchParams(window.location.search);
 const connectedBanner=query.get('connected');
 const errorBanner=query.get('error');

 return <main className='portal-shell'>
  <header className='portal-hero'>
   <div><p className='portal-eyebrow'>DANI DECLARES • OWNER HQ</p><h1>Integrations & Connections</h1><p>One controlled place to connect the systems around DANI. Secrets never belong in source code, chat, Notion, Asana, or GitHub.</p></div>
   <div className='portal-hero-actions'><Link className='portal-primary' to='/portal/hq'>← Back to DANI HQ</Link></div>
  </header>
  {(connectedBanner || errorBanner) && <section className='portal-status-banner'><div><strong>{connectedBanner ? 'Connection completed' : 'Connection issue'}</strong><p style={{margin:'6px 0 0',color:'#6d6263'}}>{connectedBanner ? connectedBanner.toUpperCase()+' is now recorded by DANI.' : decodeURIComponent(errorBanner || '').replace(/^\w+_/,'')}</p></div><span className='portal-pill'>{connectedBanner ? 'CONNECTED' : 'REVIEW'}</span></section>}
  <section className='portal-card'><p className='portal-eyebrow'>Live DANI connection state</p><h2 style={{margin:'5px 0 0'}}>First-party integrations</h2>
   {loading ? <p className='portal-note'>Checking connection state…</p> : error ? <div className='portal-alert'>{error}</div> :
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(285px,1fr))',gap:12,marginTop:18}}>
      {systems.map(s=><IntegrationCard key={s.key} system={s} state={state} env={state.env||{}} session={session} onRefresh={load}/>)}
    </div>}
  </section>
  <section className='portal-card'><p className='portal-eyebrow'>Authority map</p><h2 style={{margin:'5px 0 0'}}>One system owns each kind of truth</h2>
    <p className='portal-note'><strong>DANI / Supabase:</strong> customers, services, governed pricing, quotes, jobs, providers, compliance, authorization and operational lifecycle. <strong>GitHub:</strong> application source and migrations. <strong>Vercel:</strong> deployments/runtime. <strong>Notion:</strong> SOPs and knowledge. <strong>Asana:</strong> project/task execution. <strong>HubSpot:</strong> CRM engagement. <strong>Airtable:</strong> intentionally assigned planning/review datasets. <strong>Google:</strong> mailbox, calendar and document surfaces. <strong>PostHog:</strong> telemetry and product analytics.</p>
  </section>
  <section className='portal-card'><p className='portal-eyebrow'>Server configuration</p><h2 style={{margin:'5px 0 0'}}>Required variables</h2>
   <pre style={{whiteSpace:'pre-wrap',background:'#241d1e',color:'#f8efe4',borderRadius:12,padding:16,fontSize:12,lineHeight:1.6}}>INTEGRATION_TOKEN_ENCRYPTION_KEY
ASANA_CLIENT_ID
ASANA_CLIENT_SECRET
ASANA_REDIRECT_URI

NOTION_TOKEN
NOTION_OAUTH_CLIENT_ID
NOTION_OAUTH_CLIENT_SECRET
NOTION_OAUTH_REDIRECT_URI

QUICKBOOKS_CLIENT_ID
QUICKBOOKS_CLIENT_SECRET
QUICKBOOKS_REDIRECT_URI
QUICKBOOKS_ENVIRONMENT\n\nGOOGLE_CLIENT_ID\nGOOGLE_CLIENT_SECRET\nGOOGLE_REDIRECT_URI\n\nHUBSPOT_CLIENT_ID\nHUBSPOT_CLIENT_SECRET\nHUBSPOT_REDIRECT_URI</pre>
   <p className='portal-note'>Only set these in the server-side deployment secret store. The browser never receives the client secret or OAuth refresh token.</p>
  </section>
  <section className='portal-card'><p className='portal-eyebrow'>Google Voice / 7173</p><h2 style={{margin:'5px 0 0'}}>Keep the number unchanged while we establish the programmable call path</h2>
    <p className='portal-note'>Google Voice supports calls from the browser and app. Google documents SIP Link for eligible Standard/Premier environments with a certified SBC. DANI will not use undocumented/private Voice endpoints. The safe interim workflow is Google Voice for the actual call plus DANI HQ for caller lookup, intake, notes, channel routing and follow-up.</p>
    <div className='portal-actions'><a className='portal-primary' href='https://voice.google.com/' target='_blank' rel='noreferrer'>Open Google Voice ↗</a><Link className='portal-secondary' to='/portal/integrations'>Refresh status</Link></div>
  </section>
  <footer className='portal-footer'><Link to='/portal/hq'>DANI HQ</Link> • <Link to='/portal/operations'>Operations</Link> • <Link to='/portal/integrations'>Integrations</Link></footer>
 </main>;
}

function IntegrationsLoader(){
 const [session,setSession]=React.useState(null);
 const [loading,setLoading]=React.useState(true);
 React.useEffect(()=>{let active=true; supabase.auth.getSession().then(({data})=>{if(active){setSession(data.session||null);setLoading(false);}}); return()=>{active=false;}},[]);
 if(loading)return <main className='portal-shell'><p>Checking owner access…</p></main>;
 if(!session)return <main className='portal-shell'><div className='portal-alert'>Staff session required.</div></main>;
 return <IntegrationsCenterPage session={session}/>;
}

export default function IntegrationsCenter(){ return <RequireStaffAuth><IntegrationsLoader/></RequireStaffAuth>; }
