-- Register OpenAI as a governed, Tester-first integration candidate.
-- This records architecture only; it does not imply credentials or runtime access.
insert into public.dd_integration_adapters
(adapter_code,provider_name,integration_class,auth_model,supported_objects,inbound_events,outbound_actions,access_state,dani_authority_boundary,notes)
values
('OPENAI_API','OpenAI API','AUTOMATION','Project-scoped server-side API credential',
 '["responses","models","tool_calls","structured_outputs"]'::jsonb,
 '[]'::jsonb,
 '["generate_analysis","classify","extract_structured_data","draft_recommendations"]'::jsonb,
 'PLANNED',
 'DANI/Supabase remains authority for operational records, approvals, pricing, provider authorization, releases, and production mutations. OpenAI model output is advisory/transformational input and must pass existing governed DANI gates before any consequential mutation.',
 'Tester-first. No credential is stored in database rows or client code. Configure secrets only in the server-side runtime when the owner creates/authorizes the API project. Log model/provider/config and evidence references for governed Brain decisions. ChatGPT access does not equal DANI API access.')
on conflict (adapter_code) do update
set provider_name=excluded.provider_name,integration_class=excluded.integration_class,auth_model=excluded.auth_model,
    supported_objects=excluded.supported_objects,inbound_events=excluded.inbound_events,outbound_actions=excluded.outbound_actions,
    access_state=excluded.access_state,dani_authority_boundary=excluded.dani_authority_boundary,notes=excluded.notes,updated_at=now();
