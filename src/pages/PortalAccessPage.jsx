import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import './PortalAccessPage.css';

const OPTIONS = [
  { key:'resident', title:'Resident', desc:'I want DANI DECLARES concierge services.', portal:'Resident Portal', relationship:'RESIDENT', channel:'CH01' },
  { key:'apartment_resident', title:'Apartment Resident', desc:'I am a resident at a property whose management company works with DANI DECLARES.', portal:'Resident Portal', relationship:'APARTMENT_RESIDENT', channel:'CH01' },
  { key:'property_manager', title:'Property Manager / Apartment', desc:'I manage properties, units, turns or resident programs.', portal:'Property Operations Portal', relationship:'PROPERTY_MANAGER', channel:'CH02' },
  { key:'real_estate', title:'Real Estate Office / Brokerage', desc:'I need listing, transaction or agent support.', portal:'Real Estate Client Portal', relationship:'REAL_ESTATE', channel:'CH03' },
  { key:'business', title:'Business', desc:'I need business, workplace, print or operational support.', portal:'Business Client Portal', relationship:'BUSINESS', channel:'CH04' },
  { key:'government', title:'Government / Institution', desc:'I represent a procurement or institutional organization.', portal:'Procurement Portal', relationship:'GOVERNMENT_INSTITUTION', channel:'CH05' },
  { key:'provider', title:'Provider / Contractor', desc:'I want to qualify to fulfill DANI DECLARES work.', portal:'Provider Application', relationship:'PROVIDER', channel:null },
];

async function hashInviteToken(token) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function PortalAccessPage() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('property_invite') || '';
  const requestedRole = searchParams.get('role') || '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/portal/access';
  const audience = pathname.endsWith('/providers') ? 'provider' : pathname.endsWith('/partners') ? 'partners' : requestedRole;
  const [mode,setMode]=useState('choose');
  const [selected,setSelected]=useState(null);
  const [propertyInvite,setPropertyInvite]=useState(null);
  const [inviteChecking,setInviteChecking]=useState(false);
  const [form,setForm]=useState({firstName:'',lastName:'',email:'',phone:'',organization:'',address:'',city:'',state:'GA',zip:'',services:'',password:'',confirm:''});
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [done,setDone]=useState('');

  const visibleOptions = useMemo(() => {
    if (audience === 'provider') return OPTIONS.filter(o => o.key === 'provider');
    if (audience === 'partners') return OPTIONS.filter(o => o.key === 'property_manager' || o.key === 'real_estate');
    if (OPTIONS.some(o => o.key === audience)) return OPTIONS.filter(o => o.key === audience);
    return OPTIONS;
  }, [audience]);

  useEffect(() => {
    let cancelled = false;
    const direct = visibleOptions.length === 1 && visibleOptions[0].key !== 'apartment_resident';
    if (direct && !selected) {
      setSelected(visibleOptions[0]);
      setMode('form');
    }
    const checkInvite = async () => {
      if (!inviteToken) return;
      setInviteChecking(true); setError('');
      try {
        const tokenHash = await hashInviteToken(inviteToken);
        const { data, error:rpcError } = await supabase.rpc('dd_resolve_apartment_resident_invite', { p_token_hash: tokenHash });
        if (cancelled) return;
        if (rpcError || !data?.length) {
          setPropertyInvite(null);
          setError('This apartment resident invitation is invalid, expired, exhausted, or no longer active. Please use the invitation supplied by your property management team.');
        } else {
          setPropertyInvite(data[0]);
          setSelected(OPTIONS.find(o=>o.key==='apartment_resident'));
          setMode('form');
        }
      } catch (e) {
        if (!cancelled) setError('We could not validate the apartment resident invitation. Please use the invitation supplied by your property management team.');
      } finally { if (!cancelled) setInviteChecking(false); }
    };
    checkInvite();
    return () => { cancelled = true; };
  }, [inviteToken, visibleOptions, selected]);

  const update=(e)=>setForm({...form,[e.target.name]:e.target.value});
  const choose=(option)=>{
    setError('');
    if(option.key==='apartment_resident') {
      setError('Apartment Resident access is invitation-only. Your property must be an active DANI DECLARES property-management client. Use the resident invitation or QR code provided by your property.');
      return;
    }
    setSelected(option);setMode('form');
  };

  const portalRole=useMemo(()=>selected?.key==='provider'?'provider':selected?.key==='property_manager'?'property_manager':selected?.key==='government'?'procurement':selected?.key==='resident'||selected?.key==='apartment_resident'?'resident':'customer',[selected]);
  const isCompanyRelationship = selected?.key === 'property_manager' || selected?.key === 'real_estate' || selected?.key === 'business' || selected?.key === 'government';

  const submit=async(e)=>{
    e.preventDefault(); setError(''); setDone('');
    if(form.password.length<8)return setError('Use a password with at least 8 characters.');
    if(form.password!==form.confirm)return setError('Passwords do not match.');
    if(selected?.key==='apartment_resident' && !propertyInvite)return setError('A valid property invitation is required for Apartment Resident access.');
    setBusy(true);
    const {data,error:authError}=await supabase.auth.signUp({email:form.email.trim(),password:form.password,options:{data:{first_name:form.firstName,last_name:form.lastName,relationship_type:selected.relationship,channel_code:selected.channel}}});
    if(authError){setBusy(false);return setError(authError.message);} if(!data.user){setBusy(false);return setError('Account could not be created.');}

    const identityPayload={auth_user_id:data.user.id,portal_role:portalRole,is_active:true};
    if(selected.key==='apartment_resident') {
      identityPayload.organization_id=propertyInvite.client_organization_id;
      identityPayload.entity_id=propertyInvite.property_id;
    }
    const {data:identity,error:identityError}=await supabase.from('dd_portal_identities').insert(identityPayload).select('id').single();
    if(identityError){setBusy(false);return setError(`Account created, but portal setup needs attention: ${identityError.message}`);}

    if(selected.key==='apartment_resident') {
      const tokenHash=await hashInviteToken(inviteToken);
      const {data:consumed,error:consumeError}=await supabase.rpc('dd_consume_apartment_resident_invite',{p_token_hash:tokenHash,p_portal_identity_id:identity.id,p_auth_user_id:data.user.id});
      if(consumeError || !consumed){setBusy(false);return setError('Your account was created, but the property invitation could not be attached. Please contact your property management team for a new resident invitation.');}
    }

    if(selected.key==='provider'){
      const {error:providerError}=await supabase.from('dd_provider_applications').insert({applicant_user_id:data.user.id,application_status:'SUBMITTED',applicant_type:form.organization?'BUSINESS':'INDIVIDUAL',legal_name:form.organization||`${form.firstName} ${form.lastName}`,contact_first_name:form.firstName,contact_last_name:form.lastName,contact_email:form.email,contact_phone:form.phone,physical_address:form.address,service_area:form.city&&form.state?`${form.city}, ${form.state}`:form.state,service_notes:form.services,source:'PUBLIC_APPLICATION',referral_source:'WEBSITE_PORTAL',consent_at:new Date().toISOString(),submitted_at:new Date().toISOString()});
      if(providerError){setBusy(false);return setError(`Account created, but provider application needs attention: ${providerError.message}`);}
    } else {
      const {error:intakeError}=await supabase.from('dd_portal_onboarding_intakes').insert({auth_user_id:data.user.id,portal_role:portalRole,relationship_type:selected.relationship,channel_code:selected.channel,organization_name:selected.key==='apartment_resident'?(propertyInvite.client_display_name||form.organization||null):(form.organization||null),first_name:form.firstName,last_name:form.lastName,email:form.email,phone:form.phone,address:form.address||propertyInvite?.property_address||null,city:form.city||propertyInvite?.city||null,state_code:form.state||propertyInvite?.state_code||null,zip_code:form.zip||propertyInvite?.zip_code||null,service_area:form.city&&form.state?`${form.city}, ${form.state}`:null,requested_services:form.services.split(',').map(s=>s.trim()).filter(Boolean),client_organization_id:selected.key==='apartment_resident'?propertyInvite.client_organization_id:null,client_property_id:selected.key==='apartment_resident'?propertyInvite.property_id:null,property_resident_invite_id:selected.key==='apartment_resident'?propertyInvite.invite_id:null,intake_data:{entry_type:selected.key,portal_label:selected.portal,access_model:selected.key==='apartment_resident'?'CLIENT_PROPERTY_INVITATION':'PUBLIC_SELF_SERVICE',client_property:selected.key==='apartment_resident'?{id:propertyInvite.property_id,name:propertyInvite.property_name}:null},status:'SUBMITTED'});
      if(intakeError){setBusy(false);return setError(`Account created, but onboarding data needs attention: ${intakeError.message}`);}
    }
    setBusy(false);setDone(data.session?'Your account is ready.':'Your account is created. Check your email to confirm it, then sign in.');setMode('done');
  };

  if(inviteChecking)return <main className="portal-access"><div className="portal-success-card"><p className="portal-kicker">VERIFYING RESIDENT ACCESS</p><h1>Connecting you to your property</h1><p>Please wait while we verify the invitation from your property management team.</p></div></main>;

  if(mode==='choose')return <main className="portal-access"><div className="portal-access-inner"><p className="portal-kicker">DANI DECLARES DIGITAL FRONT DOOR</p><h1>{audience==='provider'?'Join the DANI DECLARES Provider Network':audience==='partners'?'Create Your Business Portal Account':'Choose your DANI DECLARES workspace'}</h1><p className="portal-lede">{audience==='provider'?'Tell us what you can do, where you work, and what capabilities you bring. Your application enters the provider qualification pipeline; creating an account does not authorize work.':audience==='partners'?'Property managers, apartment operators, real estate offices and brokerages can create their client workspace here. No phone call required.':'No phone call required. Create the account that matches your relationship with DANI DECLARES. Apartment Resident access is available only through an active DANI DECLARES property-management client.'}</p><div className="portal-option-grid">{visibleOptions.map(o=><button key={o.key} className="portal-option" onClick={()=>choose(o)}><span className="portal-option-title">{o.title}</span><span>{o.desc}</span><small>{o.key==='apartment_resident'?'Invitation required':o.portal}</small></button>)}</div>{error&&<div className="portal-error">{error}</div>}<p className="portal-existing">Already have an account? <Link to="/portal/login">Sign in</Link></p></div></main>;

  if(mode==='done')return <main className="portal-access"><div className="portal-success-card"><p className="portal-kicker">WELCOME TO DANI DECLARES</p><h1>{selected.portal}</h1>{selected.key==='apartment_resident'&&propertyInvite&&<p><strong>{propertyInvite.property_name}</strong><br/>{propertyInvite.client_display_name}</p>}<p>{done}</p>{isCompanyRelationship&&<p>Have company-specific vendor onboarding paperwork? You can submit the packet, supplier agreement, insurance requirements, W-9/ACH instructions and other required pages now.</p>}<div className="portal-success-actions"><Link className="portal-primary" to="/portal/login">Sign in</Link>{isCompanyRelationship&&<Link className="portal-secondary" to="/portal/vendor-onboarding">Upload vendor paperwork</Link>}<Link className="portal-secondary" to="/">Return to website</Link></div></div></main>;

  return <main className="portal-access"><div className="portal-form-card"><button className="portal-back" onClick={()=>setMode('choose')}>← Choose a different relationship</button><p className="portal-kicker">ACCOUNT SETUP</p><h1>{selected.title}</h1><p>{selected.desc}</p>{selected.key==='apartment_resident'&&propertyInvite&&<div className="portal-success-card" style={{margin:'20px 0',padding:'20px'}}><strong>Property verified</strong><br/>{propertyInvite.property_name}<br/>{propertyInvite.client_display_name}</div>}<form onSubmit={submit}><div className="portal-form-grid"><label>First name<input name="firstName" required value={form.firstName} onChange={update}/></label><label>Last name<input name="lastName" required value={form.lastName} onChange={update}/></label><label>Email<input type="email" name="email" required value={form.email} onChange={update}/></label><label>Phone<input name="phone" value={form.phone} onChange={update}/></label>{selected.key!=='apartment_resident'&&<><label className="portal-wide">Organization / Company<input name="organization" value={form.organization} onChange={update}/></label><label className="portal-wide">Address<input name="address" value={form.address} onChange={update}/></label><label>City<input name="city" value={form.city} onChange={update}/></label><label>State<input name="state" maxLength="2" value={form.state} onChange={update}/></label><label>ZIP<input name="zip" value={form.zip} onChange={update}/></label></>}<label className="portal-wide">Services / capabilities / what you need<textarea name="services" rows="4" value={form.services} onChange={update} placeholder="Separate multiple items with commas."/></label><label>Password<input type="password" name="password" minLength="8" required value={form.password} onChange={update}/></label><label>Confirm password<input type="password" name="confirm" minLength="8" required value={form.confirm} onChange={update}/></label></div>{error&&<div className="portal-error">{error}</div>}<button className="portal-primary portal-submit" disabled={busy}>{busy?'Creating account…':'Create account'}</button></form>{isCompanyRelationship&&<p className="portal-privacy">After creating your account, you can upload your company's vendor packet and any company-specific supplier requirements from the vendor onboarding page.</p>}<p className="portal-privacy">Your information is used to establish the correct customer/provider relationship and route your requests into the DANI DECLARES operating system. Apartment Resident access is tied to the verified DANI DECLARES client property invitation.</p></div></main>;
}
