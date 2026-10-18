import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { processNotificationOutbox, resumeConfigurationBlocked, emailFingerprint } from '../lib/notificationOutbox.mjs';

// Never use DATABASE_URL as a fallback. This suite owns ONLY a disposable loopback database.
const rawUrl = process.env.OUTBOX_TEST_DATABASE_URL;
if (!rawUrl) throw new Error('OUTBOX_TEST_DATABASE_URL is required; database tests must not silently skip');
const target = new URL(rawUrl);
const localReplay = process.env.OUTBOX_TEST_CONTEXT === 'ISOLATED_SUPABASE_REPLAY'
  && target.port === '54322' && target.pathname === '/postgres';
if (!['127.0.0.1', 'localhost'].includes(target.hostname) || !(target.pathname === '/outbox_pr664' || localReplay)) {
  throw new Error('Refusing non-isolated outbox test target');
}
const { PrismaClient } = await import('@prisma/client');
const client = () => new PrismaClient({ datasources: { db: { url: rawUrl } } });
const db = client();
const competitor = client();
const env = { RESEND_API_KEY:'synthetic', TWILIO_ACCOUNT_SID:'synthetic', TWILIO_API_KEY_SID:'synthetic',
  TWILIO_API_KEY_SECRET:'synthetic', TWILIO_FROM_NUMBER:'+15555550100' };
const renderEmail = () => '<p>Synthetic</p>';
const calls = [];
let mode = 'ACCEPT';
const fakeProvider = async (url, request) => {
  const channel = url.includes('resend') ? 'EMAIL' : 'SMS';
  calls.push({ channel, key:request.headers['Idempotency-Key'], body:String(request.body) });
  if (mode === 'TIMEOUT') throw new Error('synthetic recipient@example.invalid private payload');
  if (['401','403','422'].includes(mode)) return { ok:false, status:Number(mode), json:async()=>({ name:'private-provider-body' }) };
  if (mode === '429_ONCE') {
    mode = 'ACCEPT';
    return { ok:false, status:429, headers:{ get:name=>name.toLowerCase()==='retry-after'?'1':null },
      json:async()=>({ name:'private-provider-body' }) };
  }
  return { ok:true, json:async()=>channel === 'EMAIL' ? { id:'synthetic-email-'+calls.length } : { sid:'synthetic-sms-'+calls.length } };
};
const run = (overrides={}) => processNotificationOutbox({ db, env, renderEmail, fetchImpl:fakeProvider, ...overrides });
const get = async id => (await db.$queryRaw`select * from public.dd_event_outbox where id=${id}::uuid`)[0];
const insert = async (channel='EMAIL', key=crypto.randomUUID()) => {
  const payload = { to: channel === 'SMS' ? '+15555550101' : 'synthetic@example.invalid', html:'<p>Synthetic</p>', text:'Synthetic' };
  return (await db.$queryRaw`insert into public.dd_event_outbox(event_key,event_type,channel,aggregate_type,payload)
    values (${key},'SYNTHETIC',${channel},'TEST',${JSON.stringify(payload)}::jsonb) returning id`)[0].id;
};
async function reset() { await db.$executeRaw`truncate public.dd_event_outbox`; calls.length=0; mode='ACCEPT'; }
function receipt(scenario, rows) {
  console.log(JSON.stringify({ scenario, providerCalls:calls.length,
    processingAttempts:rows.reduce((n,row)=>n+row.attempts,0),
    outcomes:rows.map(row=>row.delivery_outcome) }));
}

before(async () => {
  await db.$connect(); await competitor.$connect();
  // Exact table DDL from the repository's owning migration, not an invented parallel schema.
  const base = readFileSync(new URL('../supabase/migrations/20260820140315_ddos_accounting_gateways_g8.sql',import.meta.url),'utf8');
  const ddl = base.split('\n').find(line=>line.startsWith('create table if not exists public.dd_event_outbox '));
  assert.ok(ddl);
  const migration = readFileSync(new URL('../supabase/migrations/20261016201500_dd_event_outbox_delivery_reconciliation.sql',import.meta.url),'utf8');
  assert.doesNotMatch(migration,/truncate|drop table|delete from/i);
  if (localReplay) {
    // Prove the full replay applied the candidate; do not repair its schema in setup.
    const ledger = await db.$queryRaw`select version from supabase_migrations.schema_migrations where version='20261016201500'`;
    assert.equal(ledger.length,1,'full replay must include the exact candidate migration');
    const columns = await db.$queryRaw`select column_name from information_schema.columns where table_schema='public' and table_name='dd_event_outbox'`;
    for (const column of ['provider_email_id','provider_sms_id','first_attempt_at','sms_attempt_started_at','claim_token','frozen_request']) {
      assert.ok(columns.some(row=>row.column_name===column),`candidate column missing: ${column}`);
    }
  } else {
    await db.$executeRawUnsafe(ddl);
    // Match statements without splitting quoted SQL comment values.
    const statements = migration.replace(/--[^\n]*/g, '').match(/(?:[^;']|'(?:''|[^'])*')+/g) || [];
    for (const statement of statements.filter(sql=>sql.trim())) await db.$executeRawUnsafe(statement);
  }
  console.log(JSON.stringify({ testedCommit: process.env.OUTBOX_TEST_COMMIT || execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
    database:localReplay ? 'isolated Supabase replay' : 'loopback/outbox_pr664', provider:'fake, no network', schema:'owning table DDL + PR migration' }));
});
after(async()=>{ await db.$disconnect(); await competitor.$disconnect(); });

for (const channel of ['EMAIL','SMS','INTERNAL']) test(`fresh ${channel} executes its channel handler and completes`,async()=>{
  await reset(); const id=await insert(channel); const result=await run(); const row=await get(id);
  assert.equal(result.results[0].status,'PROCESSED'); assert.equal(row.status,'PROCESSED');
  assert.equal(calls.length,channel==='INTERNAL'?0:1);
  assert.equal(row.delivery_outcome,channel==='INTERNAL'?'COMPLETED':'ACCEPTED');
  assert.equal(Boolean(row.provider_email_id),channel==='EMAIL');
  assert.equal(Boolean(row.provider_sms_id),channel==='SMS');
  assert.equal(Boolean(row.first_attempt_at),channel==='EMAIL');
  assert.equal(Boolean(row.sms_attempt_started_at),channel==='SMS');
  if (channel!=='INTERNAL') assert.equal(calls[0].channel,channel);
  await run(); assert.equal(calls.length,channel==='INTERNAL'?0:1); receipt('fresh '+channel,[row]);
});

for (const channel of ['EMAIL','SMS']) test(`${channel} missing configuration blocks without intent; explicit recovery preserves attempts`,async()=>{
  await reset(); const id=await insert(channel); const broken=channel==='EMAIL'?{...env,RESEND_API_KEY:''}:{...env,TWILIO_API_KEY_SECRET:''};
  await run({env:broken}); let row=await get(id);
  assert.equal(row.delivery_outcome,'CONFIGURATION_BLOCKED'); assert.equal(row.attempts,1);
  assert.equal(row.first_attempt_at,null); assert.equal(row.sms_attempt_started_at,null); assert.equal(calls.length,0);
  await run(); assert.equal(calls.length,0); assert.equal((await get(id)).attempts,1);
  await assert.rejects(resumeConfigurationBlocked({db,id,env:broken,renderEmail}));
  await resumeConfigurationBlocked({db,id,env,renderEmail}); await run(); row=await get(id);
  assert.equal(row.status,'PROCESSED'); assert.equal(row.attempts,2); assert.equal(calls.length,1);
  receipt('configuration recovery '+channel,[row]);
});

test('misclassified uncertain records cannot be cleared by configuration recovery',async()=>{
  await reset(); const id=await insert(); await db.$executeRaw`update public.dd_event_outbox set status='FAILED', delivery_outcome='UNCERTAIN', first_attempt_at=now() where id=${id}::uuid`;
  const before=await get(id); await assert.rejects(resumeConfigurationBlocked({db,id,env,renderEmail}));
  assert.deepEqual(await get(id),before); assert.equal(calls.length,0);
});

test('provider 422 is terminal and not replayed',async()=>{
  await reset(); mode='422'; const id=await insert(); await run(); await run(); const row=await get(id);
  assert.equal(row.delivery_outcome,'REJECTED'); assert.equal(calls.length,1); receipt('terminal 422',[row]);
});

for (const status of ['401','403']) for (const channel of ['EMAIL','SMS'])
  test(`${channel} provider ${status} requires explicit credential recovery`,async()=>{
    await reset(); mode=status; const id=await insert(channel); await run(); let row=await get(id);
    assert.equal(row.status,'FAILED'); assert.equal(row.delivery_outcome,'CREDENTIAL_REJECTED');
    assert.equal(row.attempts,1); assert.equal(calls.length,1);
    assert.equal(Boolean(row.first_attempt_at),channel==='EMAIL');
    assert.equal(Boolean(row.sms_attempt_started_at),channel==='SMS');
    const fingerprint=row.request_fingerprint; const providerError=row.last_error;
    await run(); assert.equal(calls.length,1); assert.equal((await get(id)).attempts,1);
    const broken=channel==='EMAIL'?{...env,RESEND_API_KEY:''}:{...env,TWILIO_API_KEY_SECRET:''};
    await assert.rejects(resumeConfigurationBlocked({db,id,env:broken,renderEmail}));
    await resumeConfigurationBlocked({db,id,env,renderEmail}); row=await get(id);
    assert.equal(row.status,'PENDING'); assert.equal(row.delivery_outcome,'RETRYABLE');
    assert.equal(row.attempts,1); assert.equal(row.first_attempt_at,null); assert.equal(row.sms_attempt_started_at,null);
    assert.equal(row.request_fingerprint,fingerprint); assert.equal(row.last_error,providerError);
    assert.equal(row.provider_email_id,null); assert.equal(row.provider_sms_id,null);
    mode='ACCEPT'; await run(); row=await get(id);
    assert.equal(row.status,'PROCESSED'); assert.equal(row.delivery_outcome,'ACCEPTED');
    assert.equal(row.attempts,2); assert.equal(calls.length,2);
    receipt('credential recovery '+channel+' '+status,[row]);
  });

for (const channel of ['EMAIL','SMS']) test(`${channel} provider 429 clears only its rejected intent and retries`,async()=>{
  await reset(); mode='429_ONCE'; const id=await insert(channel); await run(); let row=await get(id);
  assert.equal(row.status,'FAILED'); assert.equal(row.delivery_outcome,'RETRYABLE'); assert.equal(row.attempts,1);
  assert.equal(row.first_attempt_at,null); assert.equal(row.sms_attempt_started_at,null); assert.equal(calls.length,1);
  await db.$executeRaw`update public.dd_event_outbox set available_at=now() where id=${id}::uuid`;
  await run(); row=await get(id);
  assert.equal(row.status,'PROCESSED'); assert.equal(row.delivery_outcome,'ACCEPTED'); assert.equal(row.attempts,2);
  assert.equal(calls.length,2); assert.equal(Boolean(row.first_attempt_at),channel==='EMAIL');
  assert.equal(Boolean(row.sms_attempt_started_at),channel==='SMS'); receipt('rate limit retry '+channel,[row]);
});

test('timeout after possible acceptance is held without replay or private errors',async()=>{
  await reset(); mode='TIMEOUT'; const id=await insert(); await run(); await run(); const row=await get(id);
  assert.equal(row.delivery_outcome,'UNCERTAIN'); assert.equal(calls.length,1);
  assert.equal(row.last_error,'OUTBOX_OPERATION_FAILED'); receipt('timeout held',[row]);
});

test('same event cannot enqueue twice; two notification identities stay distinct',async()=>{
  await reset(); const a=await insert('EMAIL','same-aggregate:customer');
  await assert.rejects(insert('EMAIL','same-aggregate:customer'));
  const b=await insert('EMAIL','same-aggregate:operator'); await run(); await run();
  assert.equal(calls.length,2); assert.notEqual(calls[0].key,calls[1].key);
  receipt('distinct notifications',[await get(a),await get(b)]);
});

test('four historical exhausted failures remain byte-for-byte unchanged and unsent',async()=>{
  await reset(); const ids=[];
  for(let i=0;i<4;i++){const id=await insert('EMAIL','historical-'+i); ids.push(id);
    await db.$executeRaw`update public.dd_event_outbox set status='FAILED',attempts=5,last_error='historical' where id=${id}::uuid`;}
  const before=await Promise.all(ids.map(get)); await run(); await run();
  assert.deepEqual(await Promise.all(ids.map(get)),before); assert.equal(calls.length,0); receipt('historical exclusion',before);
});

test('competing database connections process each notification at most once',async()=>{
  await reset(); const ids=await Promise.all(Array.from({length:12},()=>insert()));
  const small={...env,NOTIFICATION_BATCH_SIZE:'1'};
  await Promise.all(Array.from({length:24},(_,i)=>run({db:i%2?db:competitor,env:small})));
  const rows=await Promise.all(ids.map(get)); assert.ok(rows.every(row=>row.status==='PROCESSED'&&row.attempts===1));
  assert.equal(calls.length,12); assert.equal(new Set(calls.map(call=>call.key)).size,12); receipt('concurrent workers',rows);
});

test('legacy PROCESSING claim without a lease remains held for its old worker to drain',async()=>{
  await reset(); const id=await insert();
  await db.$executeRaw`update public.dd_event_outbox set status='PROCESSING',attempts=1,claimed_at=null where id=${id}::uuid`;
  const before=await get(id); await run(); await run();
  assert.deepEqual(await get(id),before); assert.equal(calls.length,0); receipt('legacy claim drain hold',[before]);
});

test('crash after claim but before intent recovers safely',async()=>{
  await reset(); const id=await insert();
  const crashDb={$queryRaw:async(strings,...values)=>{const rows=await db.$queryRaw(strings,...values);if(strings.join('').includes('with eligible'))throw new Error('synthetic crash');return rows;}};
  await assert.rejects(run({db:crashDb})); assert.equal((await get(id)).first_attempt_at,null);
  await db.$executeRaw`update public.dd_event_outbox set claimed_at=now()-interval '11 minutes' where id=${id}::uuid`;
  await run(); const row=await get(id); assert.equal(row.status,'PROCESSED'); assert.equal(row.attempts,2); assert.equal(calls.length,1);receipt('crash before intent',[row]);
});

for (const stage of ['intent','acceptance']) test(`crash after ${stage} never resends`,async()=>{
  await reset(); const id=await insert(); let crashed=false;
  const crashDb={$queryRaw:async(strings,...values)=>{
    const sql=strings.join('');
    if(crashed)throw new Error('synthetic process gone');
    if(stage==='acceptance'&&sql.includes('set provider_email_id=')){crashed=true;throw new Error('synthetic process gone');}
    const rows=await db.$queryRaw(strings,...values);
    if(stage==='intent'&&sql.includes('first_attempt_at=now()')){crashed=true;throw new Error('synthetic process gone');}
    return rows;
  }};
  await assert.rejects(run({db:crashDb})); await db.$executeRaw`update public.dd_event_outbox set claimed_at=now()-interval '11 minutes' where id=${id}::uuid`;
  await run(); await run(); const row=await get(id); assert.equal(row.delivery_outcome,'UNCERTAIN');
  assert.equal(calls.length,stage==='intent'?0:1);receipt('crash after '+stage,[row]);
});

test('stale owner cannot overwrite newer reconciliation while provider is in flight',async()=>{
  await reset(); const id=await insert(); let entered,release;
  const started=new Promise(resolve=>{entered=resolve;}); const gate=new Promise(resolve=>{release=resolve;});
  const old=run({fetchImpl:async(...args)=>{entered();await gate;return fakeProvider(...args);}});
  await started;
  await competitor.$executeRaw`update public.dd_event_outbox set claimed_at=now()-interval '11 minutes' where id=${id}::uuid`;
  await run({db:competitor}); release(); const result=await old;
  const row=await get(id);assert.equal(row.delivery_outcome,'UNCERTAIN');assert.equal(row.provider_email_id,null);
  assert.equal(result.results[0].status,'CLAIM_LOST');assert.equal(calls.length,1);receipt('stale owner fenced',[row]);
});

test('final-attempt crashed claim is reconciled rather than stranded',async()=>{
  await reset(); const id=await insert();
  await db.$executeRaw`update public.dd_event_outbox set status='PROCESSING',attempts=5,first_attempt_at=now(),claimed_at=now()-interval '11 minutes' where id=${id}::uuid`;
  await run();const row=await get(id);assert.equal(row.delivery_outcome,'UNCERTAIN');assert.equal(calls.length,0);receipt('exhausted recovery',[row]);
});

test('frozen email fingerprint survives jsonb key ordering and detects changes',()=>{
  assert.equal(emailFingerprint({subject:'s',to:'a',html:'h'}),emailFingerprint({html:'h',to:'a',subject:'s'}));
  assert.notEqual(emailFingerprint({html:'h'}),emailFingerprint({html:'changed'}));
});
