
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (length(email) BETWEEN 5 AND 254),
  company text CHECK (company IS NULL OR length(company) <= 120),
  message text NOT NULL CHECK (length(btrim(message)) BETWEEN 10 AND 2000),
  status text NOT NULL DEFAULT 'novo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at_contact_messages BEFORE UPDATE ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY cm_insert_anon ON public.contact_messages FOR INSERT TO anon WITH CHECK (status = 'novo');
CREATE POLICY cm_insert_auth ON public.contact_messages FOR INSERT TO authenticated WITH CHECK (status = 'novo');
CREATE POLICY cm_select ON public.contact_messages FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY cm_update ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, public.app_role[]) FROM anon;
