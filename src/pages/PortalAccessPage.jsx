import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import { createProviderIntakeStaging } from '../lib/pendingOnboarding.js';
import { capture } from '../lib/posthogAnalytics.js';
import { captureSentryEvent, captureSentryException } from '../lib/sentry.js';
import { SITE_URL } from '../data/siteConfig.js';
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
  const resumeProvider = searchParams.get('resume') === '1';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/portal/access';
  const audience = pathname.endsWith('/providers') ? 'provider' : pathname.endsWith('/partners') ? 'partners' : requestedRole;
  const [mode,setMode]=useState('choose');
  const [selected,setSelected]=useState(null);
  const [propertyInvite,setPropertyInvite]=useState(null);
  const [inviteChecking,setInviteChecking]=useState(false);
  const [form,setForm]=useState({firstName:'',lastName:'',email:'',phone:'',organization:'',rateExpectation:'',address:'',city:'',state:'GA',zip:'',serviceRadiusMiles:'25',yearsExperience:'',availability:'',transportation:'',willingOutsideRadius:false,services:'',password:'',confirm:''});
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [done,setDone]=useState('');
  const [catalogServices,setCatalogServices]=useState([]);
  const [licenseGatedSkus,setLicenseGatedSkus]=useState(() => new Set());
  const [categories,setCategories]=useState([]);
  const [selectedServiceIds,setSelectedServiceIds]=useState(() => ({}));
  const [catalogLoading,setCatalogLoading]=useState(false);
  // Keyed by category_key -> { checked, equipmentAnswer }. Applicants pick a parent
  // skill category (Cleaning, Notary, Courier, etc.) instead of hand-picking from the
  // full 300+ item service catalog -- each category expands into its real underlying
  // services at submit time, scoped by division_id (and canonical_sku_prefix for the
  // Division-1 sub-families that genuinely need different equipment questions).
  const [selectedCategories,setSelectedCategories]=useState(() => ({}));
  const [providerStep,setProviderStep]=useState(1);
  const [providerApplicantType,setProviderApplicantType]=useState('INDIVIDUAL');
  const [resumeSession,setResumeSession]=useState(null);

  useEffect(()=>{
    if(!resumeProvider) return;
    supabase.auth.getSession().then(({data})=>{
      const session=data?.session||null;
      setResumeSession(session);
      if(session?.user){
        const meta=session.user.user_metadata||{};
        setForm(prev=>({...prev,firstName:prev.firstName||meta.first_name||'',lastName:prev.lastName||meta.last_name||'',email:session.user.email||prev.email,password:'RESUME_EXISTING_ACCOUNT',confirm:'RESUME_EXISTING_ACCOUNT'}));
        setSelected(OPTIONS.find(o=>o.key==='provider'));
        setMode('form');
      }
    });
  },[resumeProvider]);

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
        supabase.from('services').select('id, name, sku, division_id, service_family').neq('sku', 'DNI-12A-028').order('name'),
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
  // narrowed to a canonical_sku_prefix for the Division-1 sub-families). When a category
  // carries an explicit canonical_skus list instead (divisions with no sub-prefix scheme,
  // where only a subset of the division's services belong in this category), that list is
  // used verbatim rather than the division/prefix match. canonical_service_ids is the same
  // idea for real, priced services that were never assigned a canonical DNI- SKU code (so
  // there's no sku string to put in canonical_skus) -- matched by real services.id instead.
  const servicesForCategory = (category) => {
    if (Array.isArray(category.canonical_service_ids) && category.canonical_service_ids.length > 0) {
      return catalogServices.filter(s => category.canonical_service_ids.includes(s.id));
    }
    if (Array.isArray(category.canonical_skus) && category.canonical_skus.length > 0) {
      return catalogServices.filter(s => category.canonical_skus.includes(s.sku));
    }
    return catalogServices.filter(s => s.division_id === category.division_id && (!category.canonical_sku_prefix || (s.sku || '').startsWith(`DNI-${category.canonical_sku_prefix}-`)));
  };

  const setCategoryAnswer = (categoryKey, value) => {
    setSelectedCategories(prev => ({ ...prev, [categoryKey]: { ...prev[categoryKey], equipmentAnswer: value } }));
  };
  const toggleCategory = (category) => {
    const services = servicesForCategory(category);
    const checked = !selectedCategories[category.category_key]?.checked;
    setSelectedCategories(prev => ({ ...prev, [category.category_key]: { ...prev[category.category_key], checked } }));
    setSelectedServiceIds(prev => {
      const next = { ...prev };
      services.forEach(service => { if (checked) next[service.id] = true; else delete next[service.id]; });
      return next;
    });
  };

  const update=(e)=>setForm({...form,[e.target.name]:e.target.value});
  const choose=(option)=>{
    setError('');
    if(option.key==='apartment_resident') {
      setError('Apartment Resident access is invitation-only. Your property must be an active DANI DECLARES property-management client. Use the resident invitation or QR code provided by your property.');
      return;
    }
    setSelected(option);setMode('form');setProviderStep(1);
    if(option.key==='provider') { capture('provider_application_started',{route:'/portal/access'}); captureSentryEvent('account_form_started',{account_type:'provider',route:'/portal/access'}); }
  };

  const providerStepValid=()=>{
    if(providerStep===1 && !resumeProvider){
      if(!form.firstName.trim()||!form.lastName.trim()||!form.email.trim()){setError('Fill in your name and email to continue.');return false;}
      if(form.password.length<8){setError('Use a password with at least 8 characters.');return false;}
      if(form.password!==form.confirm){setError('Passwords do not match.');return false;}
    }
    if(providerStep===2){
      if(providerApplicantType==='BUSINESS'&&!form.organization.trim()){setError('Enter the business or organization name for a business provider application.');return false;}
      if(!form.address.trim()||!form.city.trim()||!form.state.trim()||!form.zip.trim()){setError('Enter the dispatch address you will normally travel from. DANI uses it to determine service area and job mileage.');return false;}
      const radius=Number(form.serviceRadiusMiles);
      if(!Number.isFinite(radius)||radius<=0||radius>250){setError('Enter a service radius between 1 and 250 miles.');return false;}
    }
    if(providerStep===3&&!Object.values(selectedCategories).some(v=>v?.checked)){setError('Select at least one service category you can fulfill.');return false;}
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
    if(selected?.key==='provider' && !Object.values(selectedCategories).some(v=>v?.checked))return setError('Select at least one service category you can fulfill.');
    setBusy(true);
    capture('signup_started',{route:'/portal/access',account_type:selected?.key||'unknown',channel:selected?.channel||undefined});
    captureSentryEvent('started',{account_type:selected?.key||'unknown',channel:selected?.channel||undefined,route:'/portal/access'});
    try{
    await submitInner();
    }catch(e){
    // Guarantees the button never gets stuck on "Creating account..." forever.
    // Without this, any unexpected exception below (a network drop, a
    // malformed response, anything not already returned as a normal
    // Supabase {error} object) would leave busy=true with no visible error --
    // exactly the "it's not letting me create account" symptom a real
    // provider hit signing up, traced back to repeated attempts colliding
    // with Supabase Auth's own signup rate limit (confirmed in project logs:
    // consecutive 429s on /auth/v1/signup within seconds of each other).
    setBusy(false);
    capture('signup_failed',{route:'/portal/access',account_type:selected?.key||'unknown',channel:selected?.channel||undefined,error_type:'unexpected'});
    const message = e?.message ? String(e.message) : '';
    setError(message || 'We could not complete account creation. Please try again once; if the problem persists, contact DANI DECLARES with the exact message shown here.');
    }
  };
  const isRateLimitError=(message)=>/rate limit|too many requests|429/i.test(String(message||''));
  const submitInner=async()=>{
    capture('provider_application_submitted',{route:'/portal/access'});
    const normalizedEmail=form.email.trim().toLowerCase();

    const identityPayload={portal_role:portalRole,is_active:true};
    if(selected.key==='apartment_resident') {
      identityPayload.organization_id=propertyInvite.client_organization_id;
      identityPayload.entity_id=propertyInvite.property_id;
    }
    const providerPayload=selected.key==='provider'?{application_status:'SUBMITTED',applicant_type:providerApplicantType,legal_name:providerApplicantType==='BUSINESS'?(form.organization||`${form.firstName} ${form.lastName}`):`${form.firstName} ${form.lastName}`,contact_first_name:form.firstName,contact_last_name:form.lastName,contact_email:form.email,contact_phone:form.phone,physical_address:form.address,service_area:form.city&&form.state?`${form.city}, ${form.state}`:form.state,service_radius_miles:Number(form.serviceRadiusMiles),service_zip_codes:form.zip?[form.zip.trim()]:[],years_experience:form.yearsExperience?Number(form.yearsExperience):null,availability:form.availability||null,vehicle_equipment:form.transportation||null,willing_outside_radius:Boolean(form.willingOutsideRadius),service_notes:form.services,source:'PUBLIC_APPLICATION',referral_source:'WEBSITE_PORTAL',consent_at:new Date().toISOString(),submitted_at:new Date().toISOString(),rate_expectation:form.rateExpectation||null}:null;
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
    const selectedServices = selected.key==='provider' ? selectedServicesPreview : [];
    const capabilityPayloads=selectedServices.map(s=>{
      const category=serviceCategoryById.get(s.id);
      const answer=category ? (selectedCategories[category.category_key]?.equipmentAnswer||'') : '';
      const isGated=licenseGatedSkus.has(s.sku);
      return {
        canonical_service_id:s.id,
        canonical_sku:s.sku,
        capability_key:category?.capability_key || null,
        capability_description:s.name,
        applicant_experience:answer||null,
        requires_license:isGated,
        ...(isGated?{}:{authorization_status:'AUTHORIZED',evidence_status:'VERIFIED',requirement_status:'NOT_REQUIRED'}),
      };
    });
    const intakePayload=selected.key!=='provider'?{portal_role:portalRole,relationship_type:selected.relationship,channel_code:selected.channel,organization_name:selected.key==='apartment_resident'?(propertyInvite.client_display_name||form.organization||null):(form.organization||null),first_name:form.firstName,last_name:form.lastName,email:form.email,phone:form.phone,address:form.address||propertyInvite?.property_address||null,city:form.city||propertyInvite?.city||null,state_code:form.state||propertyInvite?.state_code||null,zip_code:form.zip||propertyInvite?.zip_code||null,service_area:form.city&&form.state?`${form.city}, ${form.state}`:null,requested_services:form.services.split(',').map(s=>s.trim()).filter(Boolean),client_organization_id:selected.key==='apartment_resident'?propertyInvite.client_organization_id:null,client_property_id:selected.key==='apartment_resident'?propertyInvite.property_id:null,property_resident_invite_id:selected.key==='apartment_resident'?propertyInvite.invite_id:null,intake_data:{entry_type:selected.key,portal_label:selected.portal,access_model:selected.key==='apartment_resident'?'CLIENT_PROPERTY_INVITATION':'PUBLIC_SELF_SERVICE',client_property:selected.key==='apartment_resident'?{id:propertyInvite.property_id,name:propertyInvite.property_name}:null},status:'SUBMITTED'}:null;

    // Durable intake boundary is now BEFORE auth.signUp(), not after email
    // confirmation: this row exists in public.dd_provider_intake_staging the
    // moment the applicant submits, regardless of whether they ever confirm
    // their email in the same browser. See dd_create_provider_intake_staging
    // in the accompanying migration.
    const {stagingId,error:stagingError}=await createProviderIntakeStaging(supabase,{
      email:normalizedEmail,
      kind:selected.key==='provider'?'provider':selected.key,
      payload:{
        identityPayload,
        providerPayload,
        capabilityPayloads,
        intakePayload,
        inviteTokenHash:selected.key==='apartment_resident'?await hashInviteToken(inviteToken):null,
      },
    });
    if(stagingError){setBusy(false);capture('signup_failed',{route:'/portal/access',account_type:selected?.key||'unknown',error_type:'staging'});captureSentryEvent('staging_failed',{account_type:selected?.key||'unknown',error_type:'staging'});captureSentryException(stagingError,{stage:'staging'});return setError(`Something interrupted account creation: ${stagingError}`);}

    if(resumeProvider){
      if(!resumeSession?.user){setBusy(false);return setError('Sign in to your existing provider account before resuming the application.');}
      const {data:result,error:completeError}=await supabase.rpc('dd_consume_provider_intake_staging',{p_staging_id:stagingId});
      if(completeError || !result?.success){setBusy(false);return setError(completeError?.message||result?.error||'We could not restore the provider application.');}
      setBusy(false);setDone('Your provider application has been restored and submitted for review.');setMode('done');return;
    }

    const {data,error:authError}=await supabase.auth.signUp({email:normalizedEmail,password:form.password,options:{emailRedirectTo:`${SITE_URL}/portal/login?intake=${encodeURIComponent(stagingId)}`,data:{first_name:form.firstName,last_name:form.lastName,relationship_type:selected.relationship,channel_code:selected.channel}}});
    // A staging row can be left behind here (signup failed, or the email
    // already belongs to a confirmed account below) -- it simply expires
    // unconsumed per its retention window; nothing reads it without a valid
    // session for that same email, so it's inert, not a leak. Resubmitting
    // the form reuses/refreshes the same pending row (see the partial unique
    // index in the migration) rather than piling up duplicates.
    if(authError){setBusy(false);capture('signup_failed',{route:'/portal/access',account_type:selected?.key||'unknown',error_type:'auth',error_code:isRateLimitError(authError.message)?'RATE_LIMIT':'AUTH_ERROR'});return setError(isRateLimitError(authError.message)?'Too many signup attempts in a short time. Please wait about a minute before trying again -- clicking repeatedly makes this take longer, not shorter.':authError.message);} if(!data.user){setBusy(false);capture('signup_failed',{route:'/portal/access',account_type:selected?.key||'unknown',error_type:'no_user'});return setError('Account could not be created.');}
    // Supabase deliberately returns a fake success with no error and no new
    // identity when signUp() is called with an email that already belongs to
    // a confirmed account, to prevent account enumeration. data.user.identities
    // is the documented way to detect that case -- without this check, someone
    // who already has an account gets told "check your email to confirm" for an
    // account that was never actually created, which is actively misleading.
    if(data.user.identities && data.user.identities.length===0){setBusy(false);capture('signup_failed',{route:'/portal/access',account_type:selected?.key||'unknown',error_type:'existing_account'});return setError('An account with this email already exists. Sign in at the login page, or use "Forgot password" there if you don’t remember your password.');}

    if(!data.session){
      // No session yet -- email confirmation is required. The intake payload
      // is already durable server-side; dd_consume_provider_intake_staging
      // finishes the writes once the applicant confirms and a real session
      // exists, in whichever browser that happens to be (see
      // PortalLoginPage.jsx reading the ?intake= query param).
      capture('signup_completed',{route:'/portal/access',account_type:selected?.key||'unknown',signup_mode:'email_confirmation'});
      captureSentryEvent('account_created_waiting_verification',{account_type:selected?.key||'unknown',signup_mode:'email_confirmation'});
      capture('provider_application_submitted',{route:'/portal/access'});
      setBusy(false);setDone('Your account is created. Check your email to confirm it, then sign in — the rest of your onboarding will finish automatically.');setMode('done');
      return;
    }

    // Session already exists (email confirmation disabled) -- finish the
    // staged writes immediately, through the same RPC PortalLoginPage uses,
    // instead of duplicating the insert logic here.
    const {data:result,error:completeError}=await supabase.rpc('dd_consume_provider_intake_staging',{p_staging_id:stagingId});
    if(completeError || !result?.success){setBusy(false);capture('signup_failed',{route:'/portal/access',account_type:selected?.key||'unknown',error_type:'portal_setup'});return setError(`Account created, but ${(completeError?.message||result?.error||'portal setup needs attention.').replace(/^Account created, but /i,'')}`);}
    capture('signup_completed',{route:'/portal/access',account_type:selected?.key||'unknown',signup_mode:'immediate_session'});
    captureSentryEvent('completed',{account_type:selected?.key||'unknown',signup_mode:'immediate_session'});setBusy(false);setDone('Your account is ready.');setMode('done');
  };

  if(inviteChecking)return <main className="portal-access"><div className="portal-success-card"><p className="portal-kicker">VERIFYING RESIDENT ACCESS</p><h1>Connecting you to your property</h1><p>Please wait while we verify the invitation from your property management team.</p></div></main>;

  if(mode==='choose')return <main className="portal-access"><div className="portal-access-inner"><p className="portal-kicker">DANI DECLARES PLATFORM</p><h1>{audience==='provider'?'Join DANI DECLARES Provider':audience==='partners'?'Create your DANI DECLARES account':'Choose your DANI DECLARES access'}</h1><p className="portal-lede">{audience==='provider'?'Tell us what you can do, where you work, and what capabilities you bring. Your application enters the provider qualification pipeline; creating an account does not authorize work.':audience==='partners'?'Organizations can create their DANI DECLARES customer account and establish the relationship that applies to their business.':'Customers use DANI DECLARES for services, projects, memberships, requests, approvals, documents and payments. Service providers use DANI DECLARES Provider for qualification and fulfillment. Apartment Resident access is available only through an active DANI DECLARES property-management client.'}</p><div className="portal-option-grid">{visibleOptions.map(o=><button key={o.key} className="portal-option" onClick={()=>choose(o)}><span className="portal-option-title">{o.title}</span><span>{o.desc}</span><small>{o.key==='apartment_resident'?'Invitation required':o.key==='provider'?'DANI DECLARES Provider':'DANI DECLARES'}</small></button>)}</div>{error&&<div className="portal-error">{error}</div>}<p className="portal-existing">Already have an account? <Link to="/portal/login">Sign in to DANI DECLARES</Link></p></div></main>;

  if(mode==='done')return <main className="portal-access"><div className="portal-success-card"><p className="portal-kicker">{selected.key==='provider'?'ACCOUNT CREATED':'WELCOME TO DANI DECLARES'}</p><h1>{selected.key==='provider'?'Check your email':selected.portal}</h1>{selected.key==='apartment_resident'&&propertyInvite&&<p><strong>{propertyInvite.property_name}</strong><br/>{propertyInvite.client_display_name}</p>}{selected.key==='provider'?<><p>We created your DANI DECLARES account. Before you can sign in, confirm your email address.</p><div className="portal-row"><div><strong>Confirmation email</strong><small>{form.email}</small></div></div><ol style={{textAlign:'left',maxWidth:520,margin:'20px auto',lineHeight:1.7}}><li>Open the confirmation email.</li><li>Click the confirmation link.</li><li>Return here and sign in.</li></ol><p className="portal-privacy">Your application is safely staged while you confirm your email. Creating an account does not authorize work; qualification and dispatch approval happen separately.</p></>:<p>{done}</p>}{isCompanyRelationship&&<p>Have company-specific vendor onboarding paperwork? You can submit the packet after signing in.</p>}<div className="portal-success-actions"><Link className="portal-primary" to="/portal/login">Sign In</Link>{isCompanyRelationship&&<Link className="portal-secondary" to="/portal/vendor-onboarding">Upload vendor paperwork</Link>}<Link className="portal-secondary" to="/">Return to website</Link></div></div></main>;

  const providerForm = <form onSubmit={submit} onKeyDown={e=>{if(providerStep<4&&e.key==='Enter'){e.preventDefault();nextProviderStep();}}}>
    <div className="portal-wizard-steps">{PROVIDER_STEPS.map((label,index)=>{const stepNumber=index+1;return <div key={label} className={`portal-wizard-step${providerStep===stepNumber?' active':''}${providerStep>stepNumber?' done':''}`}><span>{stepNumber}</span>{label}</div>;})}</div>
    {providerStep===1&&resumeProvider&&<div className="portal-form-grid"><div className="portal-wide"><strong>Existing provider account</strong><p>You are signed in as {form.email}. Your login is being kept; continue to restore only the missing provider application.</p></div><label>First name<input name="firstName" required value={form.firstName} onChange={update}/></label><label>Last name<input name="lastName" required value={form.lastName} onChange={update}/></label><label>Email<input type="email" readOnly value={form.email}/></label><label>Phone<input name="phone" value={form.phone} onChange={update}/></label></div>}{providerStep===1&&!resumeProvider&&<div className="portal-form-grid">
      <label>First name<input name="firstName" required value={form.firstName} onChange={update}/></label>
      <label>Last name<input name="lastName" required value={form.lastName} onChange={update}/></label>
      <label>Email<input type="email" name="email" required value={form.email} onChange={update}/></label>
      <label>Phone<input name="phone" value={form.phone} onChange={update}/></label>
      <label>Password<input type="password" name="password" minLength="8" required value={form.password} onChange={update}/></label>
      <label>Confirm password<input type="password" name="confirm" minLength="8" required value={form.confirm} onChange={update} autoComplete="new-password"/></label>
    </div>}
    {providerStep===2&&<div className="portal-form-grid">
      <div className="portal-wide"><strong>How are you signing up?</strong><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:12,marginTop:10}}>
        <label className="portal-capability-item"><input type="radio" name="providerApplicantType" value="INDIVIDUAL" checked={providerApplicantType==='INDIVIDUAL'} onChange={e=>setProviderApplicantType(e.target.value)}/> Individual provider</label>
        <label className="portal-capability-item"><input type="radio" name="providerApplicantType" value="BUSINESS" checked={providerApplicantType==='BUSINESS'} onChange={e=>setProviderApplicantType(e.target.value)}/> Business / company provider</label>
      </div></div>
      <label className="portal-wide">Business / organization name {providerApplicantType==='BUSINESS'?'(required)':'(optional)'}<input name="organization" required={providerApplicantType==='BUSINESS'} value={form.organization} onChange={update}/></label>
      <label className="portal-wide">Where will you normally travel from?<input name="address" required value={form.address} onChange={update}/><small>This stays private and is used to match you with assignments you can realistically reach.</small></label>
      <label>City<input name="city" required value={form.city} onChange={update}/></label><label>State<input name="state" required maxLength="2" value={form.state} onChange={update}/></label><label>ZIP<input name="zip" required value={form.zip} onChange={update}/></label>
      <label>Normal service radius (miles)<input name="serviceRadiusMiles" required type="number" min="1" max="250" step="1" value={form.serviceRadiusMiles} onChange={update}/></label>
      <label>Years of experience (optional)<input name="yearsExperience" type="number" min="0" step="0.5" value={form.yearsExperience} onChange={update}/></label>
      <label className="portal-wide">How do you reliably get to assignments?<input name="transportation" value={form.transportation} onChange={update} placeholder="Example: personal vehicle, MARTA/bus/rail, rideshare, bicycle, or a combination"/><small>Owning a car is not required for every service. Tell us how you travel so we only match you with appropriate work.</small></label>
      <label className="portal-wide">General availability (optional)<input name="availability" value={form.availability} onChange={update} placeholder="Example: weekdays after 8 AM; weekends; 24-hour notice preferred"/></label>
      <label className="portal-wide portal-capability-item"><input type="checkbox" checked={Boolean(form.willingOutsideRadius)} onChange={e=>setForm({...form,willingOutsideRadius:e.target.checked})}/> I may consider assignments outside my normal radius when the job and travel make sense.</label>
    </div>}
    {providerStep===3&&<div className="portal-wide portal-capability-picker">
      <p>Choose the kinds of work you can perform. You do not need to search through DANI DECLARES' entire service catalog.</p>
      {catalogLoading?<p>Loading service categories…</p>:<div className="portal-capability-groups">{categories.map(category=>{
        const checked=Boolean(selectedCategories[category.category_key]?.checked);
        return <div key={category.category_key} className="portal-capability-group">
          <label className="portal-capability-item"><input type="checkbox" checked={checked} onChange={()=>toggleCategory(category)}/><span><strong>{category.label}</strong>{category.description&&<small> · {category.description}</small>}</span></label>
          {checked&&<div className="portal-capability-followup"><label>{category.equipment_prompt||'Tell us briefly about your experience in this area.'}<input type="text" value={selectedCategories[category.category_key]?.equipmentAnswer||''} onChange={e=>setCategoryAnswer(category.category_key,e.target.value)} placeholder="Describe briefly…"/></label>{category.requires_credential&&<small className="portal-capability-credential-note">Required credentials will be verified before you are authorized for regulated work.</small>}</div>}
        </div>;
      })}</div>}
    </div>}
    {providerStep===4&&<div className="portal-review">
      <h2 className="portal-review-title">Review your application</h2>
      <div className="portal-row"><div><strong>{form.firstName} {form.lastName}</strong><small>{form.email} · {form.phone||'No phone provided'}</small></div></div>
      <div className="portal-row"><div><strong>{form.organization||'Individual provider'}</strong><small>{[form.address,form.city,form.state,form.zip].filter(Boolean).join(', ')} · {form.serviceRadiusMiles} mile normal radius</small></div></div>
      <div className="portal-row"><div><strong>Travel & availability</strong><small>{form.transportation||'Not specified'} · {form.availability||'Availability not specified'}{form.willingOutsideRadius?' · May consider outside-radius work':''}</small></div></div>
      <div className="portal-row"><div><strong>{Object.values(selectedCategories).filter(v=>v?.checked).length} service categor{Object.values(selectedCategories).filter(v=>v?.checked).length===1?'y':'ies'} selected</strong><small>{categories.filter(cat=>selectedCategories[cat.category_key]?.checked).map(cat=>cat.label).join(', ')||'None selected'}</small></div></div>
      <label className="portal-wide">Rate expectations (optional)<input name="rateExpectation" value={form.rateExpectation} onChange={update} placeholder="Example: $35/hr, $125 minimum, or 'see attached price sheet'."/><small>These are provider-submitted expectations, not DANI DECLARES customer pricing.</small></label>
      <label className="portal-wide">Additional notes about your experience (optional)<textarea name="services" rows="4" value={form.services} onChange={update} placeholder="Certifications, equipment, years of experience, anything else worth knowing."/></label>
    </div>}
    {error&&<div className="portal-error">{error}</div>}
    <div className="portal-wizard-nav">{providerStep>1&&<button type="button" className="portal-secondary" onClick={backProviderStep}>Back</button>}{providerStep<4?<button type="button" className="portal-primary" onClick={nextProviderStep}>Next</button>:<button className="portal-primary portal-submit" disabled={busy}>{busy?'Creating account…':'Create account'}</button>}</div>
  </form>;

  const standardForm = <form onSubmit={submit}><div className="portal-form-grid"><label>First name<input name="firstName" required value={form.firstName} onChange={update}/></label><label>Last name<input name="lastName" required value={form.lastName} onChange={update}/></label><label>Email<input type="email" name="email" required value={form.email} onChange={update}/></label><label>Phone<input name="phone" value={form.phone} onChange={update}/></label>{selected.key!=='apartment_resident'&&<><label className="portal-wide">Organization / Company<input name="organization" value={form.organization} onChange={update}/></label><label className="portal-wide">Address<input name="address" value={form.address} onChange={update}/></label><label>City<input name="city" value={form.city} onChange={update}/></label><label>State<input name="state" maxLength="2" value={form.state} onChange={update}/></label><label>ZIP<input name="zip" value={form.zip} onChange={update}/></label></>}</div><label className="portal-wide">Services / capabilities / what you need<textarea name="services" rows="4" value={form.services} onChange={update} placeholder="Separate multiple items with commas."/></label><label>Password<input type="password" name="password" minLength="8" required value={form.password} onChange={update}/></label><label>Confirm password<input type="password" name="confirm" minLength="8" required value={form.confirm} onChange={update} autoComplete="new-password"/></label>{error&&<div className="portal-error">{error}</div>}<button className="portal-primary portal-submit" disabled={busy}>{busy?'Creating account…':'Create account'}</button></form>;

  return <main className="portal-access"><div className="portal-form-card"><button className="portal-back" onClick={()=>setMode('choose')}>← Choose a different relationship</button><p className="portal-kicker">DANI DECLARES ACCOUNT SETUP</p><h1>{selected.title}</h1><p>{selected.desc}</p>{selected.key==='apartment_resident'&&propertyInvite&&<div className="portal-success-card" style={{margin:'20px 0',padding:'20px'}}><strong>Property verified</strong><br/>{propertyInvite.property_name}<br/>{propertyInvite.client_display_name}</div>}{selected.key==='provider'?providerForm:standardForm}{isCompanyRelationship&&<p className="portal-privacy">After creating your account, you can upload your company's vendor packet and any company-specific supplier requirements from the vendor onboarding page.</p>}<p className="portal-privacy">Your information is used to establish the correct customer/provider relationship and route your requests into the DANI DECLARES operating system. Apartment Resident access is tied to the verified DANI DECLARES client property invitation.</p></div></main>;
}
