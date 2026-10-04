# DANI History-First Release Gate

A downstream release is not ready merely because its feature tests pass.

Before promotion:
- current-main overlap is reconciled;
- relevant prior lineage is classified;
- existing mechanisms were reused or repaired where possible;
- exact-head tests and designated non-production proof pass;
- required security/rollback gates pass;
- Production-specific dependencies are present;
- promotion uses the existing governed path;
- exact Production runtime is verified after release.

If current main advances after proof, re-check overlap and reconstruct/retest as needed. Never force stale work into Production simply to close a PR.
