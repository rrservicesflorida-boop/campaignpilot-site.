import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "gestor" | "operador" | "visualizador";

export type Membership = {
  organizationId: string;
  organizationName: string;
  role: AppRole;
};

export const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  operador: "Operador",
  visualizador: "Visualizador",
};

export function useOrganization() {
  const { user, loading } = useAuth();

  const query = useQuery({
    queryKey: ["organization-context", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const [{ data: memberships, error }, { data: adminRow }] = await Promise.all([
        supabase
          .from("organization_members")
          .select("organization_id, role, organizations(name)")
          .order("created_at", { ascending: true }),
        supabase.from("platform_admins").select("user_id").maybeSingle(),
      ]);

      if (error) throw error;

      const list: Membership[] = (memberships ?? []).map((row) => ({
        organizationId: row.organization_id,
        organizationName:
          (row.organizations as { name: string } | null)?.name ?? "Minha organização",
        role: row.role as AppRole,
      }));

      return { memberships: list, isPlatformAdmin: Boolean(adminRow) };
    },
  });

  const current = query.data?.memberships[0] ?? null;

  return {
    loading: loading || query.isLoading,
    error: query.error,
    memberships: query.data?.memberships ?? [],
    organizationId: current?.organizationId ?? null,
    organizationName: current?.organizationName ?? null,
    role: current?.role ?? null,
    isPlatformAdmin: query.data?.isPlatformAdmin ?? false,
    canEdit: current ? current.role !== "visualizador" : false,
    canManage: current ? current.role === "admin" || current.role === "gestor" : false,
  };
}