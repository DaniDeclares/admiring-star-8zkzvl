# Exact-Head Rule

Proof belongs to the exact commit that was tested. If a branch changes after CI, security, preview, or Tester proof, rerun the applicable checks. If main advances and the branch becomes stale or diverged, reconcile/reconstruct first. Never use an older green check as proof for a different release head.
