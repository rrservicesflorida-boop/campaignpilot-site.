import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { LoadingState, PageHeader } from "@/components/painel/PainelStates";
import { supabase } from "@/integrations/supabase/client";
import { roleLabels, useOrganization, type AppRole } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/painel/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | CampaignPilot" },
      { name: "description", content: "Dados da organização, membros e trilha de auditoria." },
      { property: "og:title", content: "Configurações | CampaignPilot" },
      { property: "og:description", content: "Organização, membros e auditoria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { user } = useAuth();
  const { organizationId, organizationName, role, canManage } = useOrganization();

  const { data, isLoading } = useQuery({
    queryKey: ["configuracoes", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const [members, logs] = await Promise.all([
        supabase.from("organization_members").select("id, user_id, role, created_at"),
        supabase
          .from("audit_logs")
          .select("id, action, entity, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      return { members: members.data ?? [], logs: logs.data ?? [] };
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Informações da organização, papéis de acesso e trilha de auditoria."
      />

      <section className="card-elevated p-6">
        <h2 className="text-base font-semibold text-foreground">Organização</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Nome</dt>
            <dd className="mt-1 text-sm text-foreground">{organizationName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Sua conta</dt>
            <dd className="mt-1 text-sm text-foreground">{user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Seu papel</dt>
            <dd className="mt-1 text-sm text-foreground">{role ? roleLabels[role] : "—"}</dd>
          </div>
        </dl>
        {!canManage ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Apenas administradores e gestores podem alterar dados da organização.
          </p>
        ) : null}
      </section>

      {isLoading ? (
        <LoadingState label="Carregando configurações..." />
      ) : (
        <>
          <section className="card-elevated p-6">
            <h2 className="text-base font-semibold text-foreground">Membros</h2>
            <ul className="mt-4 divide-y divide-border">
              {data?.members.map((member) => (
                <li key={member.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="truncate text-muted-foreground">
                    {member.user_id === user?.id ? `${user?.email} (você)` : member.user_id}
                  </span>
                  <Badge variant="secondary">{roleLabels[member.role as AppRole]}</Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className="card-elevated p-6">
            <h2 className="text-base font-semibold text-foreground">Auditoria recente</h2>
            <ul className="mt-4 divide-y divide-border">
              {data?.logs.length ? (
                data.logs.map((log) => (
                  <li key={log.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="text-foreground">{log.action}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </span>
                  </li>
                ))
              ) : (
                <li className="py-3 text-sm text-muted-foreground">Nenhum registro ainda.</li>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}