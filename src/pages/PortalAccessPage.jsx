import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import { savePendingOnboarding } from '../lib/pendingOnboarding.js';
import { capture, captureServiceLifecycle } from '../lib/posthogAnalytics.js';
import './PortalAccessPage.css';

const OPTIONS = [
  { key:'resident', title:'Resident', desc:'I want DANI DECLARES concierge services.', portal:'DANI DECLARES', relationship:'RESIDENT', channel:'CH01' },
  { key:'apartment_resident', title:'Apartment Resident', desc:'I am a resident at a property whose management company works with DANI DECLARES.', portal:'DANI DECLARES', relationship:'APARTMENT_RESIDENT', channel:'CH01' },
  { key:'property_manager', title:'Property Manager / Apartment', desc:'I manage properties, units, turns or resident programs.', portal:'DANI DECLARES', relationship:'PROPERTY_MANAGER', channel:'CH02' },
  { key:'real_estate', title:'Real Estate Office / Brokerage', desc:'I need listing, transaction or agent support.', portal:'DANI DECLARES', relationship:'REAL_ESTATE', channel:'CH03' },
  { key:'business', title:'Business', desc:'I need business, workplace, print or operational support.', portal:'DANI DECLARES', relationship:'BUSINESS', channel:'CH04' },
  { key:'government', title:'Government / Institution', desc:'I represent a procurement or institutional organization.', portal:'DANI DECLARES', relationship:'GOVERNMENT_INSTITUTION', channel:'CH05' },
  { key:'provider', title:'Service Provider', desc:'I want to qualify to fulfill DANI DECLARES work.', portal:'DANI DECLARES Provider', relationship:'PROVIDER', channel:null },
];

const PROVIDER_STEPS = ['Account', 'Business Details', 'Services', 'Review & Submit'];

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
  const [catalogServices,setCatalogServices]=useState([]);
  const [licenseGatedSkus,setLicenseGatedSkus]=useState(() => new Set());
  const [categories,setCategories]=useState([]);
  const [catalogLoading,setCatalogLoading]=useState(false);
  // Keyed by category_key -> { checked, equipmentAnswer }. Applicants pick a parent
  // skill category (Cleaning, Notary, Courier, etc.) instead of hand-picking from the
  // full 300+ item service catalog -- each category expands into its real underlying
  // services at submit time, scoped by division_id (and canonical_sku_prefix for the
  // Division-1 sub-families that genuinely need different equipment questions).
  const [selectedCategories,setSelectedCategories]=useState(() => ({}));
  const [providerStep,setProviderStep]=useState(1);

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

  const catalogFetchStarted = useRef(false);
  useEffect(() => {
    // catalogFetchStarted is a ref, not state, deliberately: the effect
    // itself calls setCatalogLoading(true) below, and if that state were in
    // this effect's dependency array, the resulting re-render would re-run
    // this effect, tearing down (via the cleanup's `cancelled = true`) the
    // very fetch it just started before it could ever resolve -- catalog
    // load would then get stuck on "Loading service catalog..." forever,
    // because the in-flight request always finds cancelled=true by the time
    // it completes.
    if (selected?.key !== 'provider' || catalogFetchStarted.current) return;
    catalogFetchStarted.current = true;
    let cancelled = false;
    const loadCatalog = async () => {
      setCatalogLoading(true);
      // Carrier Back-Office Support (DNI-12A-028) is DANI-direct admin work
      // that happens to be filed under Division 12 for commercial grouping,
      // not a field capability -- excluded from expansion the same way it
      // always has been.
      const [servicesResult, categoriesResult, requirementsResult] = await Promise.all([
        supabase.from('services').select('id, name, sku, division_id').neq('sku', 'DNI-12A-028').order('name'),
        supabase.from('dd_provider_capability_categories').select('*').order('display_order'),
        supabase.from('dd_service_capability_requirements').select('canonical_sku, requirement_code').in('requirement_code', ['LICENSE_SERVICE', 'CERT_SERVICE', 'AUTO_MOBILE']).eq('required', true),
      ]);
      if (cancelled) return;
      if (!servicesResult.error) setCatalogServices(servicesResult.data || []);
      if (!categoriesResult.error) setCategories(categoriesResult.data || []);
      if (!requirementsResult.error) setLicenseGatedSkus(new Set((requirementsResult.data || []).map(r => r.canonical_sku)));
      setCatalogLoading(false);
    };
    loadCatalog();
    return () => { cancelled = true; };
  }, [selected]);

  // A category maps to every canonical service in its division (optionally
  // narrowed to a canonical_sku_prefix for the Division-1 sub-families).
  const servicesForCategory = (category) => catalogServices.filter(s => s.division_id === category.division_id && (!category.canonical_sku_prefix || (s.sku || '').startsWith(`DNI-${category.canonical_sku_prefix}-`)));

  const toggleCategory = (categoryKey) => {
    setSelectedCategories(prev => {
      const next = { ...prev };
      if (next[categoryKey]?.checked) delete next[categoryKey];
      else { next[categoryKey] = { checked: true, equipmentAnswer: '' }; captureServiceLifecycle('provider_capability_selected',{capability_key:categoryKey,route:'/portal/access'}); }
      return next;
    });
  };
  const setCategoryAnswer = (categoryKey, value) => {
    setSelectedCategories(prev => ({ ...prev, [categoryKey]: { ...prev[categoryKey], equipmentAnswer: value } }));
  };

  const selectedCategoryCount = Object.values(selectedCategories).filter(c => c?.checked).length;
  const selectedServicesPreview = useMemo(() => {
    const active = categories.filter(c => selectedCategories[c.category_key]?.checked);
    return active.flatMap(c => servicesForCategory(c));
  }, [categories, selectedCategories, catalogServices]); // eslint-disable-line react-hooks/exhaustive-deps

  const update=(e)=>setForm({...form,[e.target.name]:e.target.value});
  const choose=(option)=>{
    setError('');
    if(option.key==='apartment_resident') {
      setError('Apartment Resident access is invitation-only. Your property must be an active DANI DECLARES property-management client. Use the resident invitation or QR code provided by your property.');
      return;
    }
    setSelected(option);setMode('form');setProviderStep(1);
    if(option.key==='provider') capture('provider_application_started',{route:'/portal/access'});
  };

  const providerStepValid=()=>{
    if(providerStep===1){
      if(!form.firstName.trim()||!form.lastName.trim()||!form.email.trim()){setError('Fill in your name and email to continue.');return false;}
      if(form.password.length<8){setError('Use a password with at least 8 characters.');return false;}
      if(form.password!==form.confirm){setError('Passwords do not match.');return false;}
    }
    if(providerStep===3&&!selectedCategoryCount){setError('Select at least one category of work you can fulfill.');return false;}
    setError('');return true;
  };
  const nextProviderStep=()=>{if(providerStepValid())setProviderStep(s=>Math.min(s+1,4));};
  const backProviderStep=()=>{setError('');setProviderStep(s=>Math.max(s-1,1));};

  const portalRole=useMemo(()=>selected?.key==='provider'?'provider':selected?.key==='property_manager'?'property_manager':selected?.key==='government'?'procurement':selected?.key==='resident'||selected?.key==='apartment_resident'?'resident':'customer',[selected]);
  const isCompanyRelationship = selected?.key === 'property_manager' || selected?.key === 'real_estate' || selected?.key === 'business' || selected?.key === 'government';

  const submit=async(e)=>{
    e.preventDefault(); setError(''); setDone('');
    if(form.password.length<8)return setError('Use a password with at least 8 characters.');
    if(form.password!==form.confirm)return setError('Passwords do not match.');
    if(selected?.key==='apartment_resident' && !propertyInvite)return setError('A valid property invitation is required for Apartment Resident access.');
    if(selected?.key==='provider' && !selectedCategoryCount)return setError('Select at least one category of work you can fulfill.');
    setBusy(true);
    capture('provider_application_submitted',{route:'/portal/access'});
    const {data,error:authError}=await supabase.auth.signUp({email:form.email.trim(),password:form.password,options:{emailRedirectTo:`${window.location.origin}/portal/login`,data:{first_name:form.firstName,last_name:form.lastName,relationship_type:selected.relationship,channel_code:selected.channel}}});
    if(authError){setBusy(false);return setError(authError.message);} if(!data.user){setBusy(false);return setError('Account could not be created.');}
    // Supabase deliberately returns a fake success with no error and no new
    // identity when signUp() is called with an email that already belongs to
    // a confirmed account, to prevent account enumeration. data.user.identities
    // is the documented way to detect that case -- without this check, someone
    // who already has an account gets told "check your email to confirm" for an
    // account that was never actually created, which is actively misleading.
    if(data.user.identities && data.user.identities.length===0){setBusy(false);return setError('An account with this email already exists. Sign in at the login page, or use "Forgot password" there if you don’t remember your password.');}

    const identityPayload={portal_role:portalRole,is_active:true};
    if(selected.key==='apartment_resident') {
      identityPayload.organization_id=propertyInvite.client_organization_id;
      identityPayload.entity_id=propertyInvite.property_id;
    }
    const providerPayload=selected.key==='provider'?{application_status:'SUBMITTED',applicant_type:form.organization?'BUSINESS':'INDIVIDUAL',legal_name:form.organization||`${form.firstName} ${form.lastName}`,contact_first_name:form.firstName,contact_last_name:form.lastName,contact_email:form.email,contact_phone:form.phone,physical_address:form.address,service_area:form.city&&form.state?`${form.city}, ${form.state}`:form.state,service_notes:form.services,source:'PUBLIC_APPLICATION',referral_source:'WEBSITE_PORTAL',consent_at:new Date().toISOString(),submitted_at:new Date().toISOString()}:null;
    // Expand each selected category into its real underlying services. A service
    // whose SKU carries a real LICENSE_SERVICE/CERT_SERVICE/AUTO_MOBILE requirement
    // (from dd_service_capability_requirements -- notary, wedding officiant, and every
    // Division-12 courier/logistics service today) is left GATED/PENDING exactly like
    // any staff-reviewed capability always has been: it still needs a real uploaded
    // credential verified by staff. Anything else is marked AUTHORIZED/VERIFIED/
    // NOT_REQUIRED right here, since there is nothing left to review -- staff's
    // existing "Approve & Activate" action (dd_approve_provider_application) already
    // refuses to approve the application at all until ID, tax form, agreement and
    // background check are cleared, so this never skips those baseline checks.
    const activeCategories=selected.key==='provider'?categories.filter(c=>selectedCategories[c.category_key]?.checked):[];
    const capabilityPayloads=activeCategories.flatMap(category=>{
      const answer=selectedCategories[category.category_key]?.equipmentAnswer||'';
      return servicesForCategory(category).map(s=>{
        const isGated=licenseGatedSkus.has(s.sku);
        return {
          canonical_service_id:s.id,
          canonical_sku:s.sku,
          capability_key:category.capability_key,
          capability_description:s.name,
          applicant_experience:answer||null,
          requires_license:isGated,
          ...(isGated?{}:{authorization_status:'AUTHORIZED',evidence_status:'VERIFIED',requirement_status:'NOT_REQUIRED'}),
        };
      });
    });
    const intakePayload=selected.key!=='provider'?{portal_role:portalRole,relationship_type:selected.relationship,channel_code:selected.channel,organization_name:selected.key==='apartment_resident'?(propertyInvite.client_display_name||form.organization||null):(form.organization||null),first_name:form.firstName,last_name:form.lastName,email:form.email,phone:form.phone,address:form.address||propertyInvite?.property_address||null,city:form.city||propertyInvite?.city||null,state_code:form.state||propertyInvite?.state_code||null,zip_code:form.zip||propertyInvite?.zip_code||null,service_area:form.city&&form.state?`${form.city}, ${form.state}`:null,requested_services:form.services.split(',').map(s=>s.trim()).filter(Boolean),client_organization_id:selected.key==='apartment_resident'?propertyInvite.client_organization_id:null,client_property_id:selected.key==='apartment_resident'?propertyInvite.property_id:null,property_resident_invite_id:selected.key==='apartment_resident'?propertyInvite.invite_id:null,intake_data:{entry_type:selected.key,portal_label:selected.portal,access_model:selected.key==='apartment_resident'?'CLIENT_PROPERTY_INVITATION':'PUBLIC_SELF_SERVICE',client_property:selected.key==='apartment_resident'?{id:propertyInvite.property_id,name:propertyInvite.property_name}:null},status:'SUBMITTED'}:null;

    if(!data.session){
      // No session yet -- email confirmation is required, so any insert right now would be
      // sent unauthenticated and RLS would correctly reject it. Defer the writes until the
      // user actually confirms their email and logs in (see completePendingOnboarding).
      savePendingOnboarding({
        kind: selected.key==='provider'?'provider':selected.key,
        email: form.email.trim(),
        identityPayload,
        providerPayload,
        capabilityPayloads,
        intakePayload,
        inviteTokenHash: selected.key==='apartment_resident'?await hashInviteToken(inviteToken):null,
      });
      capture('provider_application_submitted',{route:'/portal/access'});
      setBusy(false);setDone('Your account is created. Check your email to confirm it, then sign in — the rest of your onboarding will finish automatically.');setMode('done');
      return;
    }

    // Session already exists (email confirmation disabled) -- complete the writes now, same as before.
    const {data:identity,error:identityError}=await supabase.from('dd_portal_identities').insert({...identityPayload,auth_user_id:data.user.id}).select('id').single();
    if(identityError){setBusy(false);return setError(`Account created, but portal setup needs attention: ${identityError.message}`);}

    if(selected.key==='apartment_resident') {
      const tokenHash=await hashInviteToken(inviteToken);
      const {data:consumed,error:consumeError}=await supabase.rpc('dd_consume_apartment_resident_invite',{p_token_hash:tokenHash,p_portal_identity_id:identity.id,p_auth_user_id:data.user.id});
      if(consumeError || !consumed){setBusy(false);return setError('Your account was created, but the property invitation could not be attached. Please contact your property management team for a new resident invitation.');}
    }

    if(selected.key==='provider'){
      const {data:application,error:providerError}=await supabase.from('dd_provider_applications').insert({...providerPayload,applicant_user_id:data.user.id}).select('id').single();
      if(providerError){setBusy(false);return setError(`Account created, but provider application needs attention: ${providerError.message}`);}
      const {error:capabilityError}=await supabase.from('dd_provider_application_capabilities').insert(capabilityPayloads.map(cap=>({...cap,application_id:application.id})));
      if(capabilityError){setBusy(false);return setError(`Account created, but provider capabilities need attention: ${capabilityError.message}`);}
    } else {
      const {error:intakeError}=await supabase.from('dd_portal_onboarding_intakes').insert({...intakePayload,auth_user_id:data.user.id});
      if(intakeError){setBusy(false);return setError(`Account created, but onboarding data needs attention: ${intakeError.message}`);}
    }
    setBusy(false);setDone('Your account is ready.');setMode('done');
  };

  if(inviteChecking)return <main className="portal-access"><div className="portal-success-card"><p className="portal-kicker">VERIFYING RESIDENT ACCESS</p><h1>Connecting you to your property</h1><p>Please wait while we verify the invitation from your property management team.</p></div></main>;

  if(mode==='choose')return <main className="portal-access"><div className="portal-access-inner"><p className="portal-kicker">DANI DECLARES PLATFORM</p><h1>{audience==='provider'?'Join DANI DECLARES Provider':audience==='partners'?'Create your DANI DECLARES account':'Choose your DANI DECLARES access'}</h1><p className="portal-lede">{audience==='provider'?'Tell us what you can do, where you work, and what capabilities you bring. Your application enters the provider qualification pipeline; creating an account does not authorize work.':audience==='partners'?'Organizations can create their DANI DECLARES customer account and establish the relationship that applies to their business.':'Customers use DANI DECLARES for services, projects, memberships, requests, approvals, documents and payments. Service providers use DANI DECLARES Provider for qualification and fulfillment. Apartment Resident access is available only through an active DANI DECLARES property-management client.'}</p><div className="portal-option-grid">{visibleOptions.map(o=><button key={o.key} className="portal-option" onClick={()=>choose(o)}><span className="portal-option-title">{o.title}</span><span>{o.desc}</span><small>{o.key==='apartment_resident'?'Invitation required':o.key==='provider'?'DANI DECLARES Provider':'DANI DECLARES'}</small></button>)}</div>{error&&<div className="portal-error">{error}</div>}<p className="portal-existing">Already have an account? <Link to="/portal/login">Sign in to DANI DECLARES</Link></p></div></main>;

  if(mode==='done')return <main className="portal-access"><div className="portal-success-card"><p className="portal-kicker">WELCOME TO DANI DECLARES</p><h1>{selected.portal}</h1>{selected.key==='apartment_resident'&&propertyInvite&&<p><strong>{propertyInvite.property_name}</strong><br/>{propertyInvite.client_display_name}</p>}<p>{done}</p>{isCompanyRelationship&&<p>Have company-specific vendor onboarding paperwork? You can submit the packet, supplier agreement, insurance requirements, W-9/ACH instructions and other required pages now.</p>}{selected.key==='provider'&&<p>Your application enters the qualification pipeline once you sign in. Upload your tax form, insurance, ID and any other requested documents — DANI DECLARES reviews everything before your account becomes dispatch-eligible.</p>}<div className="portal-success-actions"><Link className="portal-primary" to="/portal/login">Sign in</Link>{isCompanyRelationship&&<Link className="portal-secondary" to="/portal/vendor-onboarding">Upload vendor paperwork</Link>}{selected.key==='provider'&&<Link className="portal-secondary" to="/portal/vendor-onboarding">Upload provider documents</Link>}<Link className="portal-secondary" to="/">Return to website</Link></div></div></main>;

  const providerForm = <form onSubmit={submit} onKeyDown={e=>{if(providerStep<4&&e.key==='Enter'){e.preventDefault();nextProviderStep();}}}>
    <div className="portal-wizard-steps">{PROVIDER_STEPS.map((label,index)=>{const stepNumber=index+1;return <div key={label} className={`portal-wizard-step${providerStep===stepNumber?' active':''}${providerStep>stepNumber?' done':''}`}><span>{stepNumber}</span>{label}</div>;})}</div>
    {providerStep===1&&<div className="portal-form-grid">
      <label>First name<input name="firstName" required value={form.firstName} onChange={update}/></label>
      <label>Last name<input name="lastName" required value={form.lastName} onChange={update}/></label>
      <label>Email<input type="email" name="email" required value={form.email} onChange={update}/></label>
      <label>Phone<input name="phone" value={form.phone} onChange={update}/></label>
      <label>Password<input type="password" name="password" minLength="8" required value={form.password} onChange={update}/></label>
      <label>Confirm password<input type="password" name="confirm" minLength="8" required value={form.confirm} onChange={update} autoComplete="new-password"/></label>
    </div>}
    {providerStep===2&&<div className="portal-form-grid">
      <label className="portal-wide">Business / organization name (optional)<input name="organization" value={form.organization} onChange={update}/></label>
      <label className="portal-wide">Address<input name="address" value={form.address} onChange={update}/></label>
      <label>City<input name="city" value={form.city} onChange={update}/></label>
      <label>State<input name="state" maxLength="2" value={form.state} onChange={update}/></label>
      <label>ZIP<input name="zip" value={form.zip} onChange={update}/></label>
    </div>}
    {providerStep===3&&<div className="portal-wide portal-capability-picker">
      <p>Pick every category of work you can do. For each one, you'll answer a quick question about your equipment or credentials — by the end, we'll know exactly which specific jobs you're eligible for.</p>
      <span className="portal-capability-count">{selectedCategoryCount} categor{selectedCategoryCount===1?'y':'ies'} selected · {selectedServicesPreview.length} service{selectedServicesPreview.length===1?'':'s'} covered</span>
      {catalogLoading?<p>Loading service categories…</p>:<div className="portal-capability-groups">{categories.map(category=>{
        const isChecked=Boolean(selectedCategories[category.category_key]?.checked);
        const serviceCount=servicesForCategory(category).length;
        return <div key={category.category_key} className="portal-capability-group">
          <label className="portal-capability-item"><input type="checkbox" checked={isChecked} onChange={()=>toggleCategory(category.category_key)}/><strong>{category.label}</strong><small> — {serviceCount} service{serviceCount===1?'':'s'}</small></label>
          {category.description&&<small className="portal-capability-desc">{category.description}</small>}
          {isChecked&&<div className="portal-capability-followup">
            {category.requires_credential&&<div className="portal-capability-credential-note">⚠ {category.credential_prompt}</div>}
            <label>{category.equipment_prompt}<input type="text" value={selectedCategories[category.category_key]?.equipmentAnswer||''} onChange={e=>setCategoryAnswer(category.category_key,e.target.value)} placeholder="Describe briefly…"/></label>
          </div>}
        </div>;
      })}</div>}
    </div>}
    {providerStep===4&&<div className="portal-review">
      <h2 className="portal-review-title">Review your application</h2>
      <div className="portal-row"><div><strong>{form.firstName} {form.lastName}</strong><small>{form.email} · {form.phone||'No phone provided'}</small></div></div>
      {form.organization&&<div className="portal-row"><div><strong>{form.organization}</strong><small>{[form.address,form.city,form.state,form.zip].filter(Boolean).join(', ')||'No address provided'}</small></div></div>}
      <div className="portal-row"><div><strong>{selectedCategoryCount} categor{selectedCategoryCount===1?'y':'ies'} selected · {selectedServicesPreview.length} service{selectedServicesPreview.length===1?'':'s'} covered</strong><small>{categories.filter(c=>selectedCategories[c.category_key]?.checked).map(c=>c.label).join(', ')||'None'}</small></div></div>
      <label className="portal-wide">Additional notes about your experience (optional)<textarea name="services" rows="4" value={form.services} onChange={update} placeholder="Certifications, equipment, years of experience, anything else worth knowing."/></label>
    </div>}
    {error&&<div className="portal-error">{error}</div>}
    <div className="portal-wizard-nav">{providerStep>1&&<button type="button" className="portal-secondary" onClick={backProviderStep}>Back</button>}{providerStep<4?<button type="button" className="portal-primary" onClick={nextProviderStep}>Next</button>:<button className="portal-primary portal-submit" disabled={busy}>{busy?'Creating account…':'Create account'}</button>}</div>
  </form>;

  const standardForm = <form onSubmit={submit}><div className="portal-form-grid"><label>First name<input name="firstName" required value={form.firstName} onChange={update}/></label><label>Last name<input name="lastName" required value={form.lastName} onChange={update}/></label><label>Email<input type="email" name="email" required value={form.email} onChange={update}/></label><label>Phone<input name="phone" value={form.phone} onChange={update}/></label>{selected.key!=='apartment_resident'&&<><label className="portal-wide">Organization / Company<input name="organization" value={form.organization} onChange={update}/></label><label className="portal-wide">Address<input name="address" value={form.address} onChange={update}/></label><label>City<input name="city" value={form.city} onChange={update}/></label><label>State<input name="state" maxLength="2" value={form.state} onChange={update}/></label><label>ZIP<input name="zip" value={form.zip} onChange={update}/></label></>}</div><label className="portal-wide">Services / capabilities / what you need<textarea name="services" rows="4" value={form.services} onChange={update} placeholder="Separate multiple items with commas."/></label><label>Password<input type="password" name="password" minLength="8" required value={form.password} onChange={update}/></label><label>Confirm password<input type="password" name="confirm" minLength="8" required value={form.confirm} onChange={update} autoComplete="new-password"/></label>{error&&<div className="portal-error">{error}</div>}<button className="portal-primary portal-submit" disabled={busy}>{busy?'Creating account…':'Create account'}</button></form>;

  return <main className="portal-access"><div className="portal-form-card"><button className="portal-back" onClick={()=>setMode('choose')}>← Choose a different relationship</button><p className="portal-kicker">DANI DECLARES ACCOUNT SETUP</p><h1>{selected.title}</h1><p>{selected.desc}</p>{selected.key==='apartment_resident'&&propertyInvite&&<div className="portal-success-card" style={{margin:'20px 0',padding:'20px'}}><strong>Property verified</strong><br/>{propertyInvite.property_name}<br/>{propertyInvite.client_display_name}</div>}{selected.key==='provider'?providerForm:standardForm}{isCompanyRelationship&&<p className="portal-privacy">After creating your account, you can upload your company's vendor packet and any company-specific supplier requirements from the vendor onboarding page.</p>}<p className="portal-privacy">Your information is used to establish the correct customer/provider relationship and route your requests into the DANI DECLARES operating system. Apartment Resident access is tied to the verified DANI DECLARES client property invitation.</p></div></main>;
}
