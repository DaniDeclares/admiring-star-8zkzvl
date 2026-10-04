# DANI Runtime Proof Standard

Do not call a capability green solely because source exists, a migration is present, a worker is registered, a cron is active, or Tester proof passed.

Production green requires authoritative evidence appropriate to the lane: exact deployed commit, Production object/function/worker availability, recent runtime execution or bounded end-to-end receipt, expected downstream handoff, and no unresolved fail-closed gate. Where a safe real execution cannot be performed, state the narrower verified condition and the remaining hold rather than upgrading it to green.
