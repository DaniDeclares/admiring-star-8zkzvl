# Merge Boundary

Merge only the replacement PR after exact-head checks and drift review. Do not merge both replacement and #558. After replacement merge, verify main and close #558 as superseded. Then take the new main SHA as the base for the next release-train reconstruction.
