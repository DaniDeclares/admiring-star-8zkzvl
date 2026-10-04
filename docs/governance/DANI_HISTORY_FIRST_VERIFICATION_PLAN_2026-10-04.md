# Verification Plan

For this documentation-only reconstruction:
1. Confirm branch is based on current main and not behind it.
2. Confirm changed paths are governance documentation/AGENTS only.
3. Run normal repository CI/checks for exact head through the pull request.
4. Require no new CodeQL/security alerts.
5. Merge only after exact-head checks are green.
6. Close the older drifted PR as superseded by the current-main reconstruction.
7. Verify main contains the governance files after merge before continuing downstream engineering.
