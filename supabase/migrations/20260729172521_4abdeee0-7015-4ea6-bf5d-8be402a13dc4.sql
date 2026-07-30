
-- ========== ENUMS ==========
CREATE TYPE public.app_role AS ENUM ('admin','gestor','operador','visualizador');
CREATE TYPE public.campaign_status AS ENUM ('rascunho','em_revisao','aprovada','programada','em_execucao','pausada','concluida','cancelada');
CREATE TYPE public.campaign_channel AS ENUM ('email','whatsapp','sms','push','multicanal');
CREATE TYPE public.lead_status AS ENUM ('novo','contatado','qualificado','oportunidade','cliente','perdido','descadastrado');
CREATE TYPE public.integration_status AS ENUM ('nao_configurado','configurado','erro','desativado');

-- ========== UPDATED_AT ==========
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ========== CORE TABLES ==========
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 2 AND 120),
  slug text UNIQUE,
  document text,
  is_blocked boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  avatar_url text,
  phone text,
  is_blocked boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'visualizador',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);

CREATE TABLE public.platform_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ========== SECURITY DEFINER HELPERS ==========
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m
    JOIN public.organizations o ON o.id = m.organization_id
    WHERE m.user_id = _user_id AND m.organization_id = _org
      AND o.deleted_at IS NULL AND o.is_blocked = false
  );
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_user_id uuid, _org uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m
    JOIN public.organizations o ON o.id = m.organization_id
    WHERE m.user_id = _user_id AND m.organization_id = _org AND m.role = ANY(_roles)
      AND o.deleted_at IS NULL AND o.is_blocked = false
  );
$$;

-- ========== DATA TABLES ==========
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (length(btrim(full_name)) BETWEEN 1 AND 200),
  email text,
  phone text,
  company text,
  job_title text,
  source text,
  status public.lead_status NOT NULL DEFAULT 'novo',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  marketing_consent boolean NOT NULL DEFAULT false,
  consent_at timestamptz,
  consent_source text,
  consent_version text,
  unsubscribed_at timestamptz,
  deleted_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_org ON public.leads(organization_id);
CREATE INDEX idx_leads_status ON public.leads(organization_id, status);
CREATE INDEX idx_leads_email ON public.leads(organization_id, lower(email));
CREATE INDEX idx_leads_created ON public.leads(organization_id, created_at DESC);

CREATE TABLE public.lead_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tag text NOT NULL CHECK (length(btrim(tag)) BETWEEN 1 AND 40),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, tag)
);
CREATE INDEX idx_lead_tags_org ON public.lead_tags(organization_id);

CREATE TABLE public.contact_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
  description text,
  deleted_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contact_lists_org ON public.contact_lists(organization_id);

CREATE TABLE public.contact_list_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  list_id uuid NOT NULL REFERENCES public.contact_lists(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (list_id, lead_id)
);
CREATE INDEX idx_clm_org ON public.contact_list_members(organization_id);

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 2 AND 160),
  description text,
  objective text,
  channel public.campaign_channel NOT NULL DEFAULT 'email',
  audience_list_id uuid REFERENCES public.contact_lists(id) ON DELETE SET NULL,
  audience_segment text,
  content_subject text,
  content_body text,
  status public.campaign_status NOT NULL DEFAULT 'rascunho',
  starts_at timestamptz,
  ends_at timestamptz,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  budget numeric(12,2) CHECK (budget IS NULL OR budget >= 0),
  is_simulation boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_campaigns_org ON public.campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(organization_id, status);

CREATE TABLE public.campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  metric_date date NOT NULL DEFAULT current_date,
  sent int NOT NULL DEFAULT 0,
  delivered int NOT NULL DEFAULT 0,
  opened int NOT NULL DEFAULT 0,
  clicked int NOT NULL DEFAULT 0,
  converted int NOT NULL DEFAULT 0,
  unsubscribed int NOT NULL DEFAULT 0,
  is_demo boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, metric_date)
);
CREATE INDEX idx_metrics_org ON public.campaign_metrics(organization_id);

CREATE TABLE public.campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_campaign_events_campaign ON public.campaign_events(campaign_id, created_at DESC);

CREATE TABLE public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  email text NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  granted boolean NOT NULL DEFAULT true,
  consent_version text NOT NULL DEFAULT 'v1',
  source text,
  ip_address inet,
  user_agent text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_consent_org ON public.consent_records(organization_id);

CREATE TABLE public.suppression_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);

CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider text NOT NULL,
  display_name text NOT NULL,
  status public.integration_status NOT NULL DEFAULT 'nao_configurado',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  credential_hint text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, provider)
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id uuid,
  action text NOT NULL,
  entity text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_org ON public.audit_logs(organization_id, created_at DESC);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  level text NOT NULL DEFAULT 'info',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

CREATE TABLE public.data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  reason text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ========== UPDATED_AT TRIGGERS ==========
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['organizations','profiles','organization_members','leads','lead_tags','contact_lists','contact_list_members','campaigns','campaign_metrics','campaign_events','consent_records','suppression_list','integrations','notifications','data_deletion_requests']
  LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at_%1$s BEFORE UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;

-- ========== SIGNUP TRIGGER ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_org uuid;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.organizations (name, created_by)
  VALUES (COALESCE(NULLIF(btrim(NEW.raw_user_meta_data->>'organization_name'),''), 'Minha organização'), NEW.id)
  RETURNING id INTO new_org;

  INSERT INTO public.organization_members (organization_id, user_id, role, created_by)
  VALUES (new_org, NEW.id, 'admin', NEW.id);

  INSERT INTO public.integrations (organization_id, provider, display_name, created_by) VALUES
    (new_org,'vtiger','Vtiger CRM',NEW.id),
    (new_org,'n8n','n8n',NEW.id),
    (new_org,'email_provider','Provedor de e-mail',NEW.id),
    (new_org,'whatsapp','WhatsApp Business Cloud API',NEW.id),
    (new_org,'webhooks','Webhooks',NEW.id),
    (new_org,'rest_api','API REST',NEW.id);

  INSERT INTO public.audit_logs (organization_id, user_id, action, entity, entity_id)
  VALUES (new_org, NEW.id, 'signup', 'auth.users', NEW.id);
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== GRANTS ==========
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations, public.profiles, public.organization_members,
  public.leads, public.lead_tags, public.contact_lists, public.contact_list_members, public.campaigns,
  public.campaign_metrics, public.campaign_events, public.consent_records, public.suppression_list,
  public.integrations, public.notifications TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT INSERT ON public.data_deletion_requests TO anon, authenticated;
GRANT SELECT, UPDATE ON public.data_deletion_requests TO authenticated;
GRANT INSERT ON public.consent_records TO anon;
GRANT ALL ON public.organizations, public.profiles, public.organization_members, public.platform_admins,
  public.leads, public.lead_tags, public.contact_lists, public.contact_list_members, public.campaigns,
  public.campaign_metrics, public.campaign_events, public.consent_records, public.suppression_list,
  public.integrations, public.audit_logs, public.notifications, public.data_deletion_requests TO service_role;

-- ========== RLS ==========
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- organizations
CREATE POLICY org_select ON public.organizations FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY org_update ON public.organizations FOR UPDATE TO authenticated
  USING (public.has_org_role(auth.uid(), id, ARRAY['admin','gestor']::public.app_role[]) OR public.is_platform_admin(auth.uid()))
  WITH CHECK (public.has_org_role(auth.uid(), id, ARRAY['admin','gestor']::public.app_role[]) OR public.is_platform_admin(auth.uid()));
CREATE POLICY org_delete ON public.organizations FOR DELETE TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- profiles
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_platform_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.organization_members m1 JOIN public.organization_members m2
      ON m1.organization_id = m2.organization_id
      WHERE m1.user_id = auth.uid() AND m2.user_id = public.profiles.id));
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_platform_admin(auth.uid()))
  WITH CHECK (id = auth.uid() OR public.is_platform_admin(auth.uid()));

-- organization_members
CREATE POLICY om_select ON public.organization_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_org_member(auth.uid(), organization_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY om_insert ON public.organization_members FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(auth.uid(), organization_id, ARRAY['admin','gestor']::public.app_role[]) OR public.is_platform_admin(auth.uid()));
CREATE POLICY om_update ON public.organization_members FOR UPDATE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['admin','gestor']::public.app_role[]) OR public.is_platform_admin(auth.uid()))
  WITH CHECK (public.has_org_role(auth.uid(), organization_id, ARRAY['admin','gestor']::public.app_role[]) OR public.is_platform_admin(auth.uid()));
CREATE POLICY om_delete ON public.organization_members FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['admin']::public.app_role[]) OR public.is_platform_admin(auth.uid()));

-- platform_admins (read own only)
CREATE POLICY pa_select ON public.platform_admins FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin(auth.uid()));

-- generic org-scoped tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['leads','lead_tags','contact_lists','contact_list_members','campaigns','campaign_metrics','campaign_events','suppression_list','integrations']
  LOOP
    EXECUTE format($f$
      CREATE POLICY %1$s_select ON public.%1$s FOR SELECT TO authenticated
        USING (public.is_org_member(auth.uid(), organization_id) OR public.is_platform_admin(auth.uid()));
      CREATE POLICY %1$s_insert ON public.%1$s FOR INSERT TO authenticated
        WITH CHECK (public.has_org_role(auth.uid(), organization_id, ARRAY['admin','gestor','operador']::public.app_role[]));
      CREATE POLICY %1$s_update ON public.%1$s FOR UPDATE TO authenticated
        USING (public.has_org_role(auth.uid(), organization_id, ARRAY['admin','gestor','operador']::public.app_role[]))
        WITH CHECK (public.has_org_role(auth.uid(), organization_id, ARRAY['admin','gestor','operador']::public.app_role[]));
      CREATE POLICY %1$s_delete ON public.%1$s FOR DELETE TO authenticated
        USING (public.has_org_role(auth.uid(), organization_id, ARRAY['admin','gestor']::public.app_role[]));
    $f$, t);
  END LOOP;
END $$;

-- consent_records
CREATE POLICY consent_select ON public.consent_records FOR SELECT TO authenticated
  USING ((organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id)) OR public.is_platform_admin(auth.uid()));
CREATE POLICY consent_insert_auth ON public.consent_records FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id));
CREATE POLICY consent_insert_anon ON public.consent_records FOR INSERT TO anon
  WITH CHECK (organization_id IS NULL);

-- audit_logs
CREATE POLICY audit_select ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid())
    OR (organization_id IS NOT NULL AND public.has_org_role(auth.uid(), organization_id, ARRAY['admin','gestor']::public.app_role[])));
CREATE POLICY audit_insert ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

-- notifications
CREATE POLICY notif_select ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY notif_update ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY notif_insert ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY notif_delete ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- data deletion requests
CREATE POLICY ddr_insert_anon ON public.data_deletion_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY ddr_insert_auth ON public.data_deletion_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY ddr_select ON public.data_deletion_requests FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY ddr_update ON public.data_deletion_requests FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
