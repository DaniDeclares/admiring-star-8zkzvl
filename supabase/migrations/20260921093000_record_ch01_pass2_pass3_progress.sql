-- Record CH01 Pass 2/3 implementation progress without promoting the channel GREEN.
-- GREEN remains reserved for validated production end-to-end proof.

update public.dd_platform_release_audit_10_pass
set status='YELLOW',
    current_state='Five governed CH01 front doors are implemented in runtime intake and persist the selected starting point. Preview deployment is successful; production merge and end-to-end proof remain outstanding.',
    blocking_gap='Production merge and resident transaction proof are still required before the front-door control can be declared GREEN.',
    required_build='Merge the governed front-door path, exercise resident intake, and prove the persisted front-door/subchannel context through checkout.',
    updated_at=now()
where channel_code='CH01' and pass_number=1;

update public.dd_platform_release_audit_10_pass
set status='YELLOW',
    current_state='CH01 now resolves front door + canonical SKU + resident subchannel through the locked dd_ch01_service_adjudication register and excludes demoted DO_NOT_SELL commercial duplicates. Live adjudication has 121 locked rows and the non-demoted commercial offer set has no duplicate canonical SKUs.',
    blocking_gap='No CH01 SKU is LIVE_READY yet, and the canonical resolver still needs production smoke proof before the identity/sellability control can be released.',
    required_build='Merge the resolver path, validate representative CH01 front-door/service combinations in production, then promote only validated release contracts to LIVE_READY.',
    updated_at=now()
where channel_code='CH01' and pass_number=2;

update public.dd_platform_release_audit_10_pass
set status='YELLOW',
    current_state='Server-side intake now re-resolves CH01 canonical service identity and price from front door, subchannel, adjudication, governed offer and locked pricing before persisting the request. Client frozen price is treated as a consistency check, not authority.',
    blocking_gap='Service-specific CH01 structured input contracts and pricing-rule provenance are still incomplete.',
    required_build='Complete CH01 service-input schemas, persistent validated scope/evidence contracts, and immutable pricing-rule/version provenance.',
    updated_at=now()
where channel_code='CH01' and pass_number=5;

update public.dd_platform_release_audit_10_pass
set status='YELLOW',
    current_state='Checkout now re-resolves the same CH01 canonical selection and binds the Stripe session to the request, service, front door, subchannel and approved estimate.',
    blocking_gap='CH01-B has no executable explicit subchannel price rules, and no CH01 service has been promoted LIVE_READY.',
    required_build='Finish exact CH01-A/CH01-B price provenance and release contracts, then run a real test checkout against a validated launch SKU.',
    updated_at=now()
where channel_code='CH01' and pass_number=6;

update public.dd_platform_release_audit_10_pass
set status='YELLOW',
    current_state='Paid CH01 webhook now re-resolves the authoritative front door/service/subchannel selection before accepting the payment and creating the job.',
    blocking_gap='CH01-specific task instantiation, dispatch authority, and end-to-end job proof remain outstanding.',
    required_build='Instantiate the CH01 task bundle atomically with job creation and prove the authoritative dd_jobs dispatch/scheduling path.',
    updated_at=now()
where channel_code='CH01' and pass_number=7;
