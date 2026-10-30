-- PROPOSED ONLY. Do not apply without separate migration approval.
-- A private owner-review store, not part of Sales or customer records.

INSERT INTO storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dd-owner-review-artifacts',
  'dd-owner-review-artifacts',
  false,
  5242880,
  ARRAY['application/octet-stream']::text[]
);

CREATE TABLE public.dd_owner_review_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_key text NOT NULL UNIQUE,
  assignment_system text NOT NULL CHECK (assignment_system = 'ASANA'),
  assignment_id text NOT NULL,
  filename text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  byte_length integer NOT NULL CHECK (byte_length BETWEEN 1 AND 5242880),
  source_environment text NOT NULL CHECK (source_environment = 'DANI_WINDOWS_WORKER'),
  review_status text NOT NULL CHECK (review_status = 'REVIEW_ONLY'),
  recipient_eligibility text NOT NULL CHECK (recipient_eligibility = 'NOT_CLEARED'),
  outbound_status text NOT NULL CHECK (outbound_status = 'NOT_SENT'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_system, assignment_id, filename)
);

ALTER TABLE public.dd_owner_review_artifacts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.dd_owner_review_artifacts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.dd_owner_review_artifacts TO service_role;

-- No authenticated or anonymous storage.objects policies are created
-- for dd-owner-review-artifacts.
-- Server authorization is mandatory because service_role bypasses RLS.
