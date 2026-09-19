ALTER TABLE public.dd_provider_organizations ADD COLUMN IF NOT EXISTS network_access_level text REFERENCES public.dd_network_access_levels(code) DEFAULT 'NONE';
ALTER TABLE public.dd_provider_organizations ADD COLUMN IF NOT EXISTS commercial_relationship_type text REFERENCES public.dd_relationship_types(code);
ALTER TABLE public.dd_provider_organizations ADD COLUMN IF NOT EXISTS equipment_summary jsonb NOT NULL DEFAULT '{}'::jsonb;
UPDATE public.dd_provider_organizations SET network_access_level='NONE' WHERE network_access_level IS NULL;