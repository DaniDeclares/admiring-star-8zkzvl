
create table if not exists public.dd_communication_events (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  direction text not null check (direction in ('INBOUND','OUTBOUND')),
  external_message_id text not null,
  external_thread_id text,
  sender_address text,
  recipient_addresses jsonb not null default '[]'::jsonb,
  subject text,
  body_excerpt text,
  received_at timestamptz,
  relationship_type text,
  relationship_id uuid,
  provider_id uuid references public.dd_providers(id) on delete set null,
  priority text not null default 'NORMAL',
  requires_attention boolean not null default false,
  attention_reason text,
  classification jsonb not null default '{}'::jsonb,
  raw_metadata jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(channel, external_message_id)
);
alter table public.dd_communication_events enable row level security;
revoke all on table public.dd_communication_events from anon, authenticated;
grant all on table public.dd_communication_events to service_role;

create index if not exists dd_communication_events_provider_idx
  on public.dd_communication_events(provider_id, received_at desc);
create index if not exists dd_communication_events_attention_idx
  on public.dd_communication_events(requires_attention, received_at desc);

create or replace function public.dd_ingest_email_communication(
  p_external_message_id text,
  p_external_thread_id text,
  p_direction text,
  p_sender_address text,
  p_recipient_addresses jsonb,
  p_subject text,
  p_body_excerpt text,
  p_received_at timestamptz,
  p_raw_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_id uuid;
  v_provider_id uuid;
  v_relationship_type text;
  v_priority text := 'NORMAL';
  v_requires_attention boolean := false;
  v_reason text;
  v_text text := lower(coalesce(p_subject,'') || ' ' || coalesce(p_body_excerpt,''));
begin
  if p_external_message_id is null or trim(p_external_message_id)='' then
    raise exception 'EXTERNAL_MESSAGE_ID_REQUIRED';
  end if;

  select p.id into v_provider_id
  from public.dd_providers p
  join public.dd_provider_organizations o on o.id=p.org_id
  where lower(coalesce(o.contact_email,''))=lower(coalesce(p_sender_address,''))
  limit 1;

  if v_provider_id is not null then
    v_relationship_type := 'PROVIDER';
  end if;

  if upper(p_direction)='INBOUND' then
    v_requires_attention := true;
    if v_provider_id is not null then
      v_priority := 'HIGH';
      v_reason := 'Inbound provider reply requires review.';
    else
      v_priority := 'NORMAL';
      v_reason := 'Inbound business email requires triage.';
    end if;

    if v_text ~ '(password|reset|login|sign[ -]?in|access|locked|cannot|can''t|error|failed|urgent|payment|invoice|legal|deadline)' then
      v_priority := 'URGENT';
      v_reason := 'Inbound business email contains an access, payment, legal, deadline, or failure signal.';
    end if;
  end if;

  insert into public.dd_communication_events(
    channel,direction,external_message_id,external_thread_id,sender_address,recipient_addresses,
    subject,body_excerpt,received_at,relationship_type,relationship_id,provider_id,
    priority,requires_attention,attention_reason,classification,raw_metadata
  ) values (
    'GMAIL',upper(p_direction),p_external_message_id,p_external_thread_id,p_sender_address,coalesce(p_recipient_addresses,'[]'::jsonb),
    p_subject,p_body_excerpt,p_received_at,v_relationship_type,v_provider_id,v_provider_id,
    v_priority,v_requires_attention,v_reason,
    jsonb_build_object('matched_provider',v_provider_id is not null,'classifier','deterministic_v1'),
    coalesce(p_raw_metadata,'{}'::jsonb)
  )
  on conflict (channel,external_message_id) do update set
    external_thread_id=excluded.external_thread_id,
    sender_address=excluded.sender_address,
    recipient_addresses=excluded.recipient_addresses,
    subject=excluded.subject,
    body_excerpt=excluded.body_excerpt,
    received_at=excluded.received_at,
    relationship_type=excluded.relationship_type,
    relationship_id=excluded.relationship_id,
    provider_id=excluded.provider_id,
    priority=excluded.priority,
    requires_attention=excluded.requires_attention,
    attention_reason=excluded.attention_reason,
    classification=excluded.classification,
    raw_metadata=excluded.raw_metadata,
    processed_at=now()
  returning id into v_id;

  if v_requires_attention then
    insert into public.dd_owner_attention_queue(
      domain,source_table,source_record_id,reason,priority,status,recommended_action,metadata
    )
    select
      'COMMUNICATIONS','dd_communication_events',v_id::text,
      coalesce(v_reason,'Inbound business communication requires review.'),
      v_priority,'OPEN',
      case when v_provider_id is not null then 'Open provider communication and respond or route it.' else 'Triage inbound business communication and attach it to the correct relationship.' end,
      jsonb_build_object(
        'channel','GMAIL',
        'external_message_id',p_external_message_id,
        'external_thread_id',p_external_thread_id,
        'provider_id',v_provider_id,
        'sender_address',p_sender_address,
        'subject',p_subject
      )
    where not exists (
      select 1 from public.dd_owner_attention_queue
      where source_table='dd_communication_events' and source_record_id=v_id::text and status='OPEN'
    );
  end if;

  return v_id;
end;
$$;

revoke all on function public.dd_ingest_email_communication(text,text,text,text,jsonb,text,text,timestamptz,jsonb) from public,anon,authenticated;
grant execute on function public.dd_ingest_email_communication(text,text,text,text,jsonb,text,text,timestamptz,jsonb) to service_role;

insert into public.dd_revenue_agent_registry
(agent_key,agent_name,responsibility,allowed_actions,prohibited_actions,is_active)
values (
  'communications_controller',
  'Relationship Communications Controller',
  'Ingest business communications, match them to governed DANI relationships, surface inbound replies immediately, classify urgency, and route human attention without changing authoritative business records.',
  '["ingest_message","match_relationship","classify_urgency","raise_owner_attention","prepare_draft","log_thread_context"]'::jsonb,
  '["silently_discard_inbound","auto_send_sensitive_reply","change_provider_authorization","change_customer_price","change_job_state","mark_resolved_without_human_or_governed_rule","invent_relationship"]'::jsonb,
  true
)
on conflict (agent_key) do update set
 agent_name=excluded.agent_name,responsibility=excluded.responsibility,
 allowed_actions=excluded.allowed_actions,prohibited_actions=excluded.prohibited_actions,is_active=true,updated_at=now();

insert into public.dd_execution_authority_map
(stage_key,authoritative_table,authoritative_record_type,prepare_authority,approve_authority,execute_authority,prohibited_parallel_sources,handoff_condition,owner_override,is_active)
values (
 'communications_inbound','dd_communication_events','BUSINESS_COMMUNICATION',
 '["communications_controller","owner","staff_admin"]'::jsonb,
 '["owner","staff_admin"]'::jsonb,
 '["communications_controller"]'::jsonb,
 '["gmail_as_crm_truth"]'::jsonb,
 'Inbound message ingested, matched or held unmatched, and any required attention surfaced.',
 true,true
)
on conflict (stage_key) do update set
 authoritative_table=excluded.authoritative_table,
 authoritative_record_type=excluded.authoritative_record_type,
 prepare_authority=excluded.prepare_authority,
 approve_authority=excluded.approve_authority,
 execute_authority=excluded.execute_authority,
 prohibited_parallel_sources=excluded.prohibited_parallel_sources,
 handoff_condition=excluded.handoff_condition,
 owner_override=true,is_active=true,updated_at=now();

insert into public.dd_agent_runtime_policy
(policy_key,agent_key,stage_key,risk_tier,max_agent_turns,max_tool_calls,max_retries,max_elapsed_seconds,token_budget,cost_budget_usd,fallback_mode,require_human_approval,breaker_destination,is_active)
values (
 'communications_inbound_v1','communications_controller','communications_inbound','HIGH',
 4,8,2,120,12000,0.50,'PAUSE_AND_ESCALATE',false,'dd_owner_attention_queue',true
)
on conflict (policy_key) do update set
 agent_key=excluded.agent_key,stage_key=excluded.stage_key,risk_tier=excluded.risk_tier,
 max_agent_turns=excluded.max_agent_turns,max_tool_calls=excluded.max_tool_calls,max_retries=excluded.max_retries,
 max_elapsed_seconds=excluded.max_elapsed_seconds,token_budget=excluded.token_budget,cost_budget_usd=excluded.cost_budget_usd,
 fallback_mode=excluded.fallback_mode,require_human_approval=excluded.require_human_approval,
 breaker_destination=excluded.breaker_destination,is_active=true,updated_at=now();
