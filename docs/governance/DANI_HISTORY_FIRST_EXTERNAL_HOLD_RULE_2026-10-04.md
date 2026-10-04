# External Hold Rule

A legitimate external dependency should block only the dependent release lane. Record the exact dependency and continue independent safe lanes. Do not weaken fail-closed behavior, fabricate proof, or repeatedly retry a blocked external mutation merely to make the release appear complete.
