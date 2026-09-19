import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';

const ACTIVE_STATUSES = new Set(['new','assigned','scheduled','dispatched','in_progress','pending_qa','ready_for_completion']);

function fmtDate(value) {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleString('en-US', { timeZone:'America/New_York', dateStyle:'medium', timeStyle:'short' });
}

function dayKey(value) {
  if (!value) return 'unscheduled';
  return new Intl.DateTimeFormat('en-CA', { timeZone:'America/New_York' }).format(new Date(value));
}

function DispatchCalendar() {
  const [jobs,setJobs]=useState([]);
  const [appointments,setAppointments]=useState([]);
  const [bookingRequests,setBookingRequests]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');

  const load=async()=>{
    setLoading(true); setError('');
    try {
      const {data:auth}=await supabase.auth.getSession();
      if(!auth.session) throw new Error('Staff session required.');
      const response=await fetch('/api/portal-operations',{headers:{Authorization:`Bearer ${auth.session.access_token}`}});
      const body=await response.json();
      if(!response.ok || !body.success) throw new Error(body.error||'Dispatch data could not be loaded.');
      const {data:bookings,error:bookingError}=await supabase.from('dd_owner_booking_requests').select('*').order('starts_at',{ascending:true}).limit(100);
      if(bookingError) throw new Error(bookingError.message);
      setJobs(body.jobs||[]);
      setAppointments(body.appointments||[]);
      setBookingRequests(bookings||[]);
    } catch(e) { setError(e.message||'Dispatch data could not be loaded.'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{load()},[]);

  const alerts=useMemo(()=>{
    const now=Date.now();
    const items=[];
    jobs.forEach(job=>{
      if(ACTIVE_STATUSES.has(job.job_status) && !job.assigned_to)
        items.push({type:'UNASSIGNED',label:'Unassigned job',detail:`${job.job_title} · ${job.public_reference||job.id}`});
      if(ACTIVE_STATUSES.has(job.job_status) && job.sla_due_at && new Date(job.sla_due_at).getTime()<now)
        items.push({type:'SLA_OVERDUE',label:'SLA overdue',detail:`${job.job_title} · due ${fmtDate(job.sla_due_at)}`});
      if(ACTIVE_STATUSES.has(job.job_status) && job.scheduled_start && new Date(job.scheduled_start).getTime()<now)
        items.push({type:'SCHEDULE_OVERDUE',label:'Scheduled start passed',detail:`${job.job_title} · ${fmtDate(job.scheduled_start)}`});
    });
    return items;
  },[jobs]);

  const calendar=useMemo(()=>{
    const map=new Map();
    const add=(date,item)=>{
      const key=dayKey(date);
      if(!map.has(key)) map.set(key,[]);
      map.get(key).push(item);
    };
    jobs.filter(j=>j.scheduled_start).forEach(j=>add(j.scheduled_start,{kind:'JOB',id:j.id,title:j.job_title,status:j.job_status,start:j.scheduled_start,end:j.scheduled_end,provider:j.assigned_to||'Unassigned',location:j.location_address}));
    appointments.filter(a=>a.starts_at).forEach(a=>add(a.starts_at,{kind:'APPOINTMENT',id:a.id,title:a.title||'Appointment',status:a.appointment_status,start:a.starts_at,end:a.ends_at,provider:a.provider_id||'Provider pending'}));
    bookingRequests.filter(b=>b.starts_at && b.status!=='CANCELLED' && b.status!=='DECLINED').forEach(b=>add(b.starts_at,{kind:'BOOKING',id:b.id,title:b.service_name||'Owner booking request',status:b.status,start:b.starts_at,end:b.ends_at,provider:'Owner booking',location:b.location_address}));
    return [...map.entries()].sort(([a],[b])=>a.localeCompare(b));
  },[jobs,appointments,bookingRequests]);

  return <main style={{maxWidth:1200,margin:'0 auto',padding:'28px 20px'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'flex-start',marginBottom:24}}>
      <div><p style={{fontSize:12,fontWeight:800,letterSpacing:1.5}}>DANI DECLARES OPERATING SYSTEM</p><h1 style={{margin:'4px 0'}}>Dispatch & Calendar</h1><p style={{color:'#666'}}>Operational scheduling surface. Commercial authority remains upstream in the frozen estimate; this screen coordinates jobs, appointments and dispatch readiness.</p></div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button onClick={load}>Refresh</button><Link to="/portal/operations">Operations Console</Link></div>
    </header>

    {error&&<div role="alert" style={{padding:12,background:'#fff1f1',border:'1px solid #e2aaaa',borderRadius:8,marginBottom:16}}>{error}</div>}

    <section style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:12,marginBottom:20}}>
      <div style={{padding:16,border:'1px solid #ddd',borderRadius:10}}><small>Active jobs</small><h2>{loading?'…':jobs.filter(j=>ACTIVE_STATUSES.has(j.job_status)).length}</h2></div>
      <div style={{padding:16,border:'1px solid #ddd',borderRadius:10}}><small>Open alerts</small><h2>{loading?'…':alerts.length}</h2></div>
      <div style={{padding:16,border:'1px solid #ddd',borderRadius:10}}><small>Scheduled items</small><h2>{loading?'…':calendar.reduce((n,[,items])=>n+items.length,0)}</h2></div>
    </section>

    {alerts.length>0&&<section style={{marginBottom:20}}>
      <h2>Attention Required</h2>
      {alerts.map((a,i)=><div key={i} style={{padding:12,margin:'8px 0',border:'1px solid #e1c7c7',borderRadius:8}}><strong>{a.label}</strong><div>{a.detail}</div></div>)}
    </section>}

    <section>
      <h2>Calendar</h2>
      {loading?<p>Loading dispatch calendar…</p>:calendar.length===0?<p>No scheduled jobs, appointments, or booking requests.</p>:calendar.map(([day,items])=><div key={day} style={{marginBottom:18}}>
        <h3>{new Date(day+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</h3>
        {items.sort((a,b)=>new Date(a.start)-new Date(b.start)).map(item=><div key={item.kind+'-'+item.id} style={{display:'grid',gridTemplateColumns:'150px 1fr auto',gap:14,alignItems:'start',padding:12,border:'1px solid #ddd',borderRadius:8,margin:'6px 0'}}>
          <strong>{fmtDate(item.start)}</strong>
          <div><strong>{item.title}</strong><div style={{fontSize:13,color:'#666'}}>{item.kind} · {item.status} · {item.provider}</div>{item.location&&<div style={{fontSize:13,color:'#666'}}>{item.location}</div>}</div>
          {item.kind==='JOB'&&<span style={{fontWeight:700}}>{item.status}</span>}
        </div>)}
      </div>)}
    </section>
  </main>;
}

export default function DispatchCalendarPage(){return <RequireStaffAuth><DispatchCalendar/></RequireStaffAuth>}
