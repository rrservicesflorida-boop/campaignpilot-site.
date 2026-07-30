import { supabase } from "@/integrations/supabase/client";

export async function logAudit(params: {
  organizationId: string | null;
  action: string;
  entity?: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return;
  await supabase.from("audit_logs").insert({
    organization_id: params.organizationId,
    user_id: userId,
    action: params.action,
    entity: params.entity ?? null,
    entity_id: params.entityId ?? null,
    metadata: (params.metadata ?? {}) as never,
  });
}