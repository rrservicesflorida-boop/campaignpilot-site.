import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Mail, Network, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DemoBadge } from "@/components/public/DemoBadge";
import { LoadingState, PageHeader } from "@/components/painel/PainelStates";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

export const Route = createFileRoute("/painel/integracoes")({
  head: () => ({
    meta: [
      { title: "Integrações | CampaignPilot" },
      {
        name: "description",
        content: "Arquitetura preparada para Vtiger CRM, n8n, e-mail transacional e WhatsApp Business.",
      },
      { property: "og:title", content: "Integrações | CampaignPilot" },
      { property: "og:description", content: "Conectores preparados para ativação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: IntegracoesPage,
});

const catalog = [
  {
    provider: "vtiger",
    name: "Vtiger CRM",
    icon: Network,
    description:
      "Sincronização bidirecional de leads e oportunidades. Requer URL da instância e token de acesso.",
  },
  {
    provider: "n8n",
    name: "n8n",
    icon: Workflow,
    description: "Automações e webhooks de eventos de campanha para orquestrar fluxos externos.",
  },
  {
    provider: "email",
    name: "E-mail transacional",
    icon: Mail,
    description: "Provedor SMTP/API para disparo de campanhas com domínio verificado (SPF/DKIM).",
  },
  {
    provider: "whatsapp",
    name: "WhatsApp Business",
    icon: MessageSquare,
    description: "Envio via API oficial com modelos aprovados e controle de opt-in por contato.",
  },
];

const statusLabels: Record<string, string> = {
  nao_configurado: "Não configurado",
  configurado: "Configurado",
  erro: "Erro",
  desativado: "Desativado",
};

function IntegracoesPage() {
  const { organizationId } = useOrganization();

  const { data, isLoading } = useQuery({
    queryKey: ["integrations", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integrations")
        .select("id, provider, display_name, status, credential_hint");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrações"
        description="Conectores previstos na arquitetura. Nenhuma credencial real é exigida nesta versão."
      />
      <DemoBadge />

      {isLoading ? (
        <LoadingState label="Carregando integrações..." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {catalog.map((item) => {
            const record = (data ?? []).find((row) => row.provider === item.provider);
            const status = record?.status ?? "nao_configurado";
            return (
              <article key={item.provider} className="card-elevated p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                      <item.icon className="size-5" aria-hidden="true" />
                    </span>
                    <h2 className="text-base font-semibold text-foreground">{item.name}</h2>
                  </div>
                  <Badge variant={status === "configurado" ? "default" : "secondary"}>
                    {statusLabels[status] ?? status}
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{item.description}</p>
                {record?.credential_hint ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Credencial: {record.credential_hint}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        <h2 className="text-sm font-semibold text-foreground">Como a ativação funcionará</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>Credenciais são armazenadas como segredos no backend, nunca no navegador.</li>
          <li>Cada organização configura seus próprios conectores, isolados por RLS.</li>
          <li>Eventos de campanha são publicados via webhook assinado para o n8n.</li>
          <li>Envios só são liberados após verificação de domínio e opt-in válido.</li>
        </ol>
      </div>
    </div>
  );
}