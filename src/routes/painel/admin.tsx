import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState, PageHeader } from "@/components/painel/PainelStates";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

export const Route = createFileRoute("/painel/admin")({
  head: () => ({
    meta: [
      { title: "Administração da plataforma | CampaignPilot" },
      { name: "description", content: "Visão global de organizações e solicitações LGPD." },
      { property: "og:title", content: "Administração | CampaignPilot" },
      { property: "og:description", content: "Visão global da plataforma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isPlatformAdmin, loading } = useOrganization();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-plataforma"],
    enabled: isPlatformAdmin,
    queryFn: async () => {
      const [orgs, requests] = await Promise.all([
        supabase
          .from("organizations")
          .select("id, name, is_blocked, created_at")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("data_deletion_requests")
          .select("id, email, status, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      return { orgs: orgs.data ?? [], requests: requests.data ?? [] };
    },
  });

  if (loading) return <LoadingState label="Verificando permissões..." />;

  if (!isPlatformAdmin) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Esta área é exclusiva para administradores da plataforma CampaignPilot."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administração da plataforma"
        description="Visão global de organizações e solicitações de exclusão de dados."
      />

      {isLoading ? (
        <LoadingState label="Carregando dados globais..." />
      ) : (
        <>
          <section className="card-elevated p-6">
            <h2 className="text-base font-semibold text-foreground">Organizações</h2>
            <ul className="mt-4 divide-y divide-border">
              {data?.orgs.map((org) => (
                <li key={org.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-foreground">{org.name}</span>
                  <Badge variant={org.is_blocked ? "destructive" : "secondary"}>
                    {org.is_blocked ? "Bloqueada" : "Ativa"}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className="card-elevated p-6">
            <h2 className="text-base font-semibold text-foreground">
              Solicitações de exclusão (LGPD)
            </h2>
            <ul className="mt-4 divide-y divide-border">
              {data?.requests.length ? (
                data.requests.map((request) => (
                  <li key={request.id} className="flex items-center justify-between py-3 text-sm">
                    <span className="text-foreground">{request.email}</span>
                    <Badge variant="outline">{request.status}</Badge>
                  </li>
                ))
              ) : (
                <li className="py-3 text-sm text-muted-foreground">Nenhuma solicitação.</li>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}