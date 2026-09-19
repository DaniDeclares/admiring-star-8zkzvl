create table if not exists private.dd_service_capability_relationship (
 id uuid primary key default gen_random_uuid(),
 service_id uuid not null references public.services(id) on delete restrict,
 capability_key text not null,
 relationship_type text not null check (relationship_type in ('PRIMARY','SECONDARY','SUPPORTING','REQUIRED','COMPONENT')),
 commercial_status text not null default 'PENDING_RECONCILIATION',
 fulfillment_dependency text,
 source_type text,
 source_reference text,
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(service_id, capability_key, relationship_type)
);
create index if not exists idx_dd_service_capability_relationship_capability on private.dd_service_capability_relationship(capability_key);
create index if not exists idx_dd_service_capability_relationship_service on private.dd_service_capability_relationship(service_id);
comment on table private.dd_service_capability_relationship is 'Canonical bridge between DANI customer-facing services and the capability universe; provider evidence never owns commercial service identity.';
comment on column private.dd_service_capability_relationship.relationship_type is 'Relationship of capability to service; PRIMARY is the canonical owning capability.';