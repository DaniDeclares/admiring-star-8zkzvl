-- Fail closed automated research evidence.
-- Automated source-watch matches are observations, not confirmation of a claim.
update public.dd_research_evidence
set evidence_status='PARTIAL',
    notes=case
      when coalesce(notes,'') ilike 'Automated source watcher observation only%' then notes
      else 'Automated source watcher observation only; prior automated CONFIRMED status was downgraded because a signal match is not proof of the claim. ' || coalesce(notes,'')
    end,
    metadata=coalesce(metadata,'{}'::jsonb) || '{"confirmationRequired":true,"signalSemantics":"OBSERVATION_ONLY","autoConfirmationRemediated":true}'::jsonb,
    updated_at=now()
where evidence_status='CONFIRMED'
  and coalesce((metadata->>'automated')::boolean,false)=true;
