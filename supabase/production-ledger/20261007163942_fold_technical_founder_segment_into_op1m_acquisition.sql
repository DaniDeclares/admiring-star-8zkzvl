update dd_acquisition_campaigns_v1
set metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
  'technical_founder_segment', jsonb_build_object(
    'status','ACTIVE_RESEARCH_SEGMENT',
    'buyer_channel','CH04',
    'segment','TECHNICAL_FOUNDERS_AND_BUILDERS',
    'qualification_signals', jsonb_build_array(
      'working product or active build',
      'commercialization is unclear or weak',
      'needs users or customers',
      'pricing uncertainty',
      'positioning or productization gap',
      'marketing or sales gap',
      'launch or customer acquisition problem',
      'founder overload across build and growth'
    ),
    'candidate_offer_skus', jsonb_build_array(
      'DNI-08A-001','DNI-08A-003','DNI-08A-004','DNI-08A-006','DNI-08A-007',
      'DNI-08A-008','DNI-08A-009','DNI-08A-014','DNI-08A-015','DNI-08A-016',
      'DNI-08A-017','DNI-08A-018','DNI-08A-019','DNI-07A-001','DNI-07A-002','DNI-07A-003'
    ),
    'research_sources', jsonb_build_array('technical founder communities','local AI and LLM communities','builder communities','developer communities','startup communities'),
    'routing_rule','Research and classify first. A build post alone is not buying intent. Escalate toward sales only when commercialization pain, growth need, or explicit business need is evidenced.',
    'engagement_rule','Participate naturally where useful; do not spam groups or cold-pitch every builder.',
    'owner_gate','No outbound message or public pitch without existing owner approval rules.'
  )
),
updated_at=now()
where campaign_key='HANDLE_IT_DISCOVERY';

update dd_acquisition_campaigns_v1
set metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
  'technical_founder_content_signal', jsonb_build_object(
    'status','ACTIVE',
    'purpose','Use real founder/building observations as Operation $1M market intelligence and content only when grounded in actual evidence.',
    'no_auto_publish',true,
    'no_assumed_buying_intent',true
  )
),
updated_at=now()
where campaign_key='OP1M_CREATOR_ENGINE';
