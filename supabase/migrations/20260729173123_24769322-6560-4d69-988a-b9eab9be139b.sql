
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, public.app_role[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, public.app_role[]) TO authenticated;

DROP POLICY ddr_insert_anon ON public.data_deletion_requests;
DROP POLICY ddr_insert_auth ON public.data_deletion_requests;
CREATE POLICY ddr_insert_anon ON public.data_deletion_requests FOR INSERT TO anon
  WITH CHECK (status = 'pendente' AND length(btrim(email)) BETWEEN 5 AND 254);
CREATE POLICY ddr_insert_auth ON public.data_deletion_requests FOR INSERT TO authenticated
  WITH CHECK (status = 'pendente' AND length(btrim(email)) BETWEEN 5 AND 254);
