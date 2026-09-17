-- Division 05 (Notary) has 6 PRESERVED_CANDIDATE rows. 2 are duplicates of already-live
-- services -- merging those now (no pricing judgment required, pure deduplication):
--   - General Notary Work -> General Notarization (DNI-05A-002)
--   - Notary Document Scanback & Return -> Notary Package Handling (DNI-05A-018)
--     ("scanback & return" is the industry term for exactly what a generic
--     "package handling" stub would mean in practice)
--
-- The other 4 (Apostille & Authentication Assistance, Loan Modification Signing
-- Support, Refinance & HELOC Signing Support, Reverse Mortgage Signing Support) are
-- genuinely distinct new services, but are DELIBERATELY LEFT UNPRICED here. Danielle
-- already caught and corrected one underpriced notary rate this session (Loan Signing
-- was live at $75, should have started at $150) and explicitly said notary pricing
-- research quality has been unreliable and asked to be given her own real rates rather
-- than have them re-guessed from generic web research. These 4 are held as
-- PRESERVED_CANDIDATE, not reconciled, until she provides real numbers.

CREATE TEMP TABLE tmp_d05_merges (
  target_service_id uuid,
  candidate_master_id uuid,
  new_description text
);

INSERT INTO tmp_d05_merges VALUES
  ('6fa7bb3c-5e8f-440f-8c92-cfb685111838', '26e27919-690b-4abc-a7d0-34d39ee4e1dd',
   'State-authorized notarial services for eligible documents, including identity verification, acknowledgments, jurats and other permitted acts within applicable GA or SC commission scope.'),
  ('c1165b91-3a1a-4414-b228-9f07d30220ee', 'b08eda19-a466-4d99-9a16-badc72a105f5',
   'Post-signing scanback, packaging and document-return coordination according to client, lender or title instructions; custody and delivery limits remain engagement-specific.')
;

UPDATE public.services s SET description = t.new_description, updated_at = now()
FROM tmp_d05_merges t WHERE s.id = t.target_service_id;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = 'Merged 2026-09-17: duplicate of an already-live Division-05A service (same real-world job under a different name). Description consolidated onto the live SKU; this candidate retired rather than priced separately.'
FROM tmp_d05_merges t WHERE m.id = t.candidate_master_id;

DROP TABLE tmp_d05_merges;
