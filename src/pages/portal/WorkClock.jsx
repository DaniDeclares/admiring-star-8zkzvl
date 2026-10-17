import React, {useEffect,useMemo,useState} from 'react';
import clockModule from '../../lib/operations/workClock2026.js';
const { DANI_CLOCK_TASKS, minutesForEntry, summarizeEntries } = clockModule;

const DEFAULT_STUDY='MAINTENANCE_PREP';
const fmt=minutes=>{const n=Math.max(0,Math.floor(minutes));return Math.floor(n/60)+'h '+String(n%60).padStart(2,'0')+'m';};
export default function WorkClock({session,mode='owner',jobId=null}) {
  const [study,setStudy]=useState(DEFAULT_STUDY);
  const [task,setTask]=useState('ACCESS_SAFETY');
  const [clock,setClock]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [now,setNow]=useState(Date.now());
  const [refreshCount,setRefreshCount]=useState(0);
  const owner=mode==='owner';
  useEffect(()=>{const tick=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(tick);},[]);
  useEffect(()=>{
    if(!session?.access_token)return;
    let cancelled=false;
    const controller=new AbortController();
    const load=async()=>{
      try {
        const qs=new URLSearchParams({workClock:'1'});
        if(jobId)qs.set('jobId',jobId);
        const response=await fetch('/api/portal-operations?'+qs.toString(),{
          headers:{Authorization:'Bearer '+session.access_token},cache:'no-store',signal:controller.signal});
        const body=await response.json();
        if(!response.ok||!body.success)throw new Error(body.error||'Time ledger could not load.');
        if(!cancelled){setClock(body.clock);setError('');}
      }catch(e){if(!cancelled&&e.name!=='AbortError')setError(e.message||'Clock unavailable.');}
    };
    load();
    return()=>{cancelled=true;controller.abort();};
  },[session?.access_token,jobId,refreshCount]);
  const submit=async event=>{
    if(!owner||!session?.access_token||busy)return;
    setBusy(true);setError('');setNotice('');
    try{
      const response=await fetch('/api/portal-operations',{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},
        body:JSON.stringify({action:'work_clock',event,studyCode:study,taskCode:task})
      });
      const body=await response.json();
      if(!response.ok||!body.success)throw new Error(body.error||'Clock could not be updated.');
      const fresh=await fetch('/api/portal-operations?workClock=1',{headers:{Authorization:'Bearer '+session.access_token},cache:'no-store'});
      const f=await fresh.json();
      if(!fresh.ok||!f.success)throw new Error(f.error||'Punch saved, but the ledger did not refresh.');
      setClock(f.clock);
      setNotice(event==='PAUSE'?'Paused. Break time is excluded.':event==='CLOCK_OUT'?'Clocked out. Work time saved.':event==='RESUME'?'Back on the clock.':'Clocked in. Task time is being recorded.');
    }catch(e){setError(e.message||'Clock update failed. Please refresh before retrying.');}
    finally{setBusy(false);}
  };
  const rows=useMemo(()=>clock?.entries||[],[clock]);
  const active=clock?.running||null;
  const latest=rows[0]||null;
  const paused=!active&&latest?.entry_status==='PAUSED';
  const total=useMemo(()=>summarizeEntries(rows,new Date(now)),[rows,now]);
  const studyTasks=DANI_CLOCK_TASKS[study]||[];
  const category=taskLabel=>{
    const [group,key]=taskLabel.split(':');
    return DANI_CLOCK_TASKS[group]?.find(([id])=>id===key)?.[1]||key.replaceAll('_',' ');
  };
  const clockInfo=active?{label:category((active.metadata?.study_code||'')+':'+(active.metadata?.task_code||'')),minutes:minutesForEntry(active,new Date(now))}:null;
  return <section className="portal-card" id={owner?'owner-work-clock':undefined} aria-label={owner?'Owner time study clock':'Provider job time ledger'}>
    <div className="owner-command-section-head"><div>
      <p className="portal-eyebrow">{owner?'Owner HQ · Labor evidence':'DANI FIELD · Job time'}</p>
      <h2>{owner?'Clock in / Clock out':'Recorded job time'}</h2>
      <p className="portal-note">{owner?'Use this clock in your HQ browser on your computer. Server-side punches continue if you leave the tab. This is internal time research, never a customer booking or provider payroll.':'This uses the existing provider job ledger; your Start/Pause/Resume/Submit buttons control work time. Break minutes are excluded.'}</p>
    </div></div>
    {error&&<div className="portal-alert" role="alert">{error}</div>}
    {notice&&<div className="portal-success" role="status">{notice}</div>}
    {clock?.activeElsewhere&&<div className="portal-alert" role="alert">Another job or clock segment is active on this account. End it there before starting a new task.</div>}
    {owner&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12,marginTop:12}}>
      <label>Work stream
        <select disabled={busy||!!active||paused} value={study} onChange={e=>{setStudy(e.target.value);setTask(DANI_CLOCK_TASKS[e.target.value][0][0]);}} style={{display:'block',width:'100%',padding:10,marginTop:4}}>
          <option value="MAINTENANCE_PREP">Home maintenance preparation</option>
          <option value="MONDAY_SALES">Monday sales readiness</option>
          <option value="PRINTIFY_MERCH">Printify merchandise</option>
        </select>
      </label>
      <label>Work block
        <select disabled={busy||!!active||paused} value={task} onChange={e=>setTask(e.target.value)} style={{display:'block',width:'100%',padding:10,marginTop:4}}>
          {studyTasks.map(([id,label])=><option key={id} value={id}>{label}</option>)}
        </select>
      </label>
    </div>}
    <div className="portal-summary-grid" style={{marginTop:16}}>
      <div className="portal-summary-tile"><strong>{fmt(total.minutes)}</strong><span>Recorded working time (up to 500 latest entries)</span></div>
      <div className="portal-summary-tile"><strong>{active?'CLOCKED IN':paused?'PAUSED':'CLOCKED OUT'}</strong><span>{active?clockInfo?.label:paused?'Break not counted':'Ready for next task'}</span></div>
      {active&&<div className="portal-summary-tile"><strong>{fmt(clockInfo.minutes)}</strong><span>Current uninterrupted work block</span></div>}
    </div>
    {owner&&<button type="button" className="secondary" disabled={busy} onClick={()=>setRefreshCount(n=>n+1)} style={{marginTop:12}}>Refresh saved punches</button>}
    {owner&&<div className="portal-actions" style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:16}}>
      <button className="portal-primary" type="button" disabled={busy||!!active||paused||clock?.activeElsewhere} onClick={()=>submit('START')}>Clock in</button>
      <button type="button" disabled={busy||!active} onClick={()=>submit('PAUSE')}>Pause / Break</button>
      <button type="button" disabled={busy||!paused||clock?.activeElsewhere} onClick={()=>submit('RESUME')}>Resume prior task</button>
      <button className="secondary" type="button" disabled={busy||(!active&&!paused)} onClick={()=>submit('CLOCK_OUT')}>Clock out</button>
    </div>}
    {rows.length>0&&<details style={{marginTop:16}}><summary>Time by work block and recent punches</summary>
      <div style={{marginTop:10}}>
      {Object.entries(total.byTask).map(([name,minutes])=><div className="portal-row" key={name}><div><strong>{category(name)}</strong><small>{name.split(':')[0].replaceAll('_',' ')}</small></div><strong>{fmt(minutes)}</strong></div>)}
      {clock?.truncated&&<p className="portal-alert">Showing the most recent 500 entries; export or reporting is needed for full lifetime totals.</p>}
      <p className="portal-note">Recent punches · server timestamps · pauses are excluded from labor</p>
      {rows.slice(0,12).map(row=><div className="portal-row" key={row.id}><div><strong>{category((row.metadata?.study_code||'PROVIDER_JOB')+':'+(row.metadata?.task_code||'FIELD_WORK'))}</strong><small>{new Date(row.started_at).toLocaleString()} · {row.entry_status}</small></div><strong>{fmt(minutesForEntry(row,new Date(now)))}</strong></div>)}
      </div>
    </details>}
  </section>;
}
