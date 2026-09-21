import React from 'react';
import { Link } from 'react-router-dom';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import './PortalWorkspacePage.css';

const systems = [
  { name:'Asana', state:'CREDENTIALS REQUIRED', auth:'OAuth 2.0', callback:'https://danideclares.com/api/integrations/asana/callback', href:'https://app.asana.com/0/my-apps' },
  { name:'Notion', state:'CREDENTIALS REQUIRED', auth:'Internal connection token (preferred for DANI workspace) or public OAuth', callback:'https://danideclares.com/api/integrations/notion/callback', href:'https://www.notion.so/my-integrations' },
  { name:'QuickBooks Online', state:'CREDENTIALS REQUIRED', auth:'OAuth 2.0', callback:'https://danideclares.com/api/integrations/quickbooks/callback', href:'https://developer.intuit.com/app/developer/qbo/docs/get-started' },
  { name:'Google Voice', state:'NO PUBLIC API PATH', auth:'Supported web/app access; SIP Link only where eligible', callback:'Not applicable', href:'https://voice.google.com/' },
];

function IntegrationsCenterPage(){
 return <main className='portal-shell'>
  <header className='portal-hero'>
   <div><p className='portal-eyebrow'>DANI DECLARES • OWNER HQ</p><h1>Integrations & Connections</h1><p>One controlled place to configure the outside systems that surround DANI. Secrets never belong in source code or chat.</p></div>
   <div className='portal-hero-actions'><Link className='portal-primary' to='/portal/hq'>← Back to DANI HQ</Link></div>
  </header>
  <section className='portal-status-banner'><div><strong>Connection state</strong><p style={{margin:'6px 0 0',color:'#6d6263'}}>A provider is not marked connected until authorization succeeds and a safe DANI-side read test passes.</p></div><span className='portal-pill'>CONTROLLED</span></section>
  <section className='portal-card'><p className='portal-eyebrow'>First-party connections</p><h2 style={{margin:'5px 0 0'}}>Asana • Notion • QuickBooks Online</h2>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(285px,1fr))',gap:12,marginTop:18}}>
    {systems.map(s=><div key={s.name} style={{border:'1px solid #e6d9c8',borderRadius:16,padding:18,background:'#fff'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:10}}><strong style={{fontSize:18,color:'#6b1f2b'}}>{s.name}</strong><span className='portal-pill'>{s.state}</span></div>
      <p style={{fontSize:12,color:'#75696a',lineHeight:1.5}}><strong>Auth:</strong> {s.auth}</p>
      <p style={{fontSize:12,color:'#75696a',lineHeight:1.5,wordBreak:'break-word'}}><strong>Callback:</strong> {s.callback}</p>
      <a className='portal-primary' href={s.href} target='_blank' rel='noreferrer'>Open provider ↗</a>
    </div>)}
   </div>
  </section>
  <section className='portal-card'><p className='portal-eyebrow'>Exact server variables</p><h2 style={{margin:'5px 0 0'}}>Add values only in the deployment secret store</h2>
    <pre style={{whiteSpace:'pre-wrap',background:'#241d1e',color:'#f8efe4',borderRadius:12,padding:16,fontSize:12,lineHeight:1.6}}>ASANA_CLIENT_ID
ASANA_CLIENT_SECRET
ASANA_REDIRECT_URI

NOTION_TOKEN
NOTION_OAUTH_CLIENT_ID
NOTION_OAUTH_CLIENT_SECRET
NOTION_OAUTH_REDIRECT_URI

QUICKBOOKS_CLIENT_ID
QUICKBOOKS_CLIENT_SECRET
QUICKBOOKS_REDIRECT_URI
QUICKBOOKS_ENVIRONMENT</pre>
    <p className='portal-note'>Never paste secret values into DANI tasks, GitHub, Notion, or ChatGPT/Claude. Use Vercel/server-side secrets.</p>
  </section>
  <section className='portal-card'><p className='portal-eyebrow'>Google Voice / 7173</p><h2 style={{margin:'5px 0 0'}}>Keep the number safe while we build the programmable voice layer</h2>
    <p className='portal-note'>Google's current supported browser path is voice.google.com. A direct Google Voice API has not been identified in current official developer documentation. For true in-DANI calling, the durable route is a programmable telephony/WebRTC layer, potentially using a supported SIP Link architecture or a deliberate number migration.</p>
    <a className='portal-primary' href='https://voice.google.com/' target='_blank' rel='noreferrer'>Open Google Voice ↗</a>
  </section>
  <footer className='portal-footer'><Link to='/portal/hq'>DANI HQ</Link> • <Link to='/portal/operations'>Operations</Link> • <Link to='/portal/integrations'>Integrations</Link></footer>
 </main>
};

export default function IntegrationsCenter(){ return <RequireStaffAuth><IntegrationsCenterPage /></RequireStaffAuth>; }