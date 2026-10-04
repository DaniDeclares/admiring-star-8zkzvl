# DANI Stale Branch Reconstruction Rule

When an open branch is behind or diverged from current main, do not force-merge it merely because its earlier proof passed.

Recover the branch's still-valid bounded delta, classify any superseded pieces, reconstruct the valid work on current main, and rerun exact-head CI, security, non-production proof, deployment preview, and applicable runtime checks. Only the reconstructed current-main delta may continue through the governed release path.
