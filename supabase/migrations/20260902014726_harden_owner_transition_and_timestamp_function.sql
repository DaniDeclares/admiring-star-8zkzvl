CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.dd_owner_transition_work_order(p_work_order_id uuid, p_new_status text, p_payload jsonb DEFAULT '{}'::jsonb)
RETURNS public.dd_work_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_row public.dd_work_orders;
BEGIN
  IF NOT private.dd_has_portal_role('OWNER_OPERATOR'::public.dd_portal_role) THEN
    RAISE EXCEPTION 'Owner/operator role required';
  END IF;
  UPDATE public.dd_work_orders
  SET status = p_new_status,
      updated_at = now(),
      fos_qa_exception_payload = CASE WHEN p_payload IS NULL THEN fos_qa_exception_payload ELSE p_payload END
  WHERE id = p_work_order_id
  RETURNING * INTO v_row;
  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Work order not found';
  END IF;
  RETURN v_row;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.dd_owner_transition_work_order(uuid,text,jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.dd_owner_transition_work_order(uuid,text,jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.dd_owner_transition_work_order(uuid,text,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.dd_owner_transition_work_order(uuid,text,jsonb) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM authenticated;