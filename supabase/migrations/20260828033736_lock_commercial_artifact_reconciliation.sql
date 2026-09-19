create table if not exists public.dd_commercial_artifact_register (
 id uuid primary key default gen_random_uuid(),
 artifact_code text not null unique,
 artifact_name text not null,
 artifact_type text not null check (artifact_type in ('VENDOR_PACKET','RESIDENT_WELCOME_PACKET','RESIDENT_GUIDE','BROCHURE','FLYER','OTHER')),
 audience text,
 source_reference text,
 status text not null default 'AUDIT_SOURCE' check (status in ('AUDIT_SOURCE','DRAFT','READY_FOR_PRINT','SUPERSEDED','ARCHIVED')),
 master_catalog_dependency boolean not null default true,
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
comment on table public.dd_commercial_artifact_register is 'Tracks customer-facing printed collateral as downstream artifacts of the Master Service Universe. Artifact content must be reconciled before print to minimize rework and prevent catalog drift.';
insert into public.dd_commercial_artifact_register (artifact_code,artifact_name,artifact_type,audience,source_reference,status,notes) values
('ART-VENDOR-PACKET','DANI DECLARES Vendor Packet','VENDOR_PACKET','Property management / apartment decision-makers','Library: Pasted markdown.md (2026-08-07)','AUDIT_SOURCE','Use as service-evidence source; preserve existing packet structure/content until master reconciliation identifies required changes.'),
('ART-RESIDENT-GUIDE','Community Concierge & Resident Life Guide','RESIDENT_GUIDE','Apartment residents','Library: Resident Concierge Magazine.docx (2026-08-15)','AUDIT_SOURCE','Use as resident-facing service/pricing evidence. Existing guide includes cleaning, laundry, organization, subscriptions, notary, merch/brand tech, events/holiday staging, and snack delivery.'),
('ART-RESIDENT-WELCOME','Resident Welcome Packet','RESIDENT_WELCOME_PACKET','Apartment residents','Historical project artifact referenced in Library materials','AUDIT_SOURCE','Track as downstream artifact; exact current source file/version must be identified before print.' )
on conflict (artifact_code) do update set source_reference=excluded.source_reference,notes=excluded.notes,updated_at=now();