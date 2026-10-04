# DANI Downstream Convergence Terminal States

Every downstream engineering lane should end in one explicit state:

- **PRODUCTION_GREEN** — exact current Production source/runtime behavior is verified.
- **SUPERSEDED / RECONCILED** — newer authoritative Production machinery replaces the older candidate and the lineage is reconciled.
- **LEGITIMATELY_HELD** — an exact external, owner, credential, security, legal, or platform dependency prevents safe promotion while independent lanes continue.
- **BROKEN / REPAIR UNDERWAY** — a bounded defect is proven and repair is actively following the existing authority path.

Configured, queued, registered, or Tester-passing alone is not PRODUCTION_GREEN.
