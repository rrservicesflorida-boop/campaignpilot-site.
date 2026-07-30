import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, MousePointerClick, Send, Target, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/public/DemoBadge";
import { LoadingState, PageHeader } from "@/components/painel/PainelStates";
import { demoActivity, demoChannels, demoPerformance } from "@/lib/demo";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

export const Route = createFileRoute("/painel/")({
  head: () => ({
    meta: [
      { title: "Visão geral | CampaignPilot" },
      { name: "description", content: "Métricas e atividade recente da sua organização." },
      { property: "og:title", content: "Visão geral | CampaignPilot" },
      { property: "og:description", content: "Métricas e atividade recente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VisaoGeral,
});

function VisaoGeral() {
  const { organizationId, organizationName } = useOrganization();

  const { data, isLoading } = useQuery({
    queryKey: ["painel-resumo", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const [leads, campaigns, ativas] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }).is("deleted_at", null),
        supabase
          .from("campaigns")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null),
        supabase
          .from("campaigns")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null)
          .in("status", ["programada", "em_execucao"]),
      ]);
      return {
        leads: leads.count ?? 0,
        campanhas: campaigns.count ?? 0,
        ativas: ativas.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Leads cadastrados", value: data?.leads ?? 0, icon: Users, hint: "dados reais" },
    { label: "Campanhas", value: data?.campanhas ?? 0, icon: Send, hint: "dados reais" },
    { label: "Campanhas ativas", value: data?.ativas ?? 0, icon: Target, hint: "dados reais" },
    { label: "Taxa de clique média", value: "18,4%", icon: MousePointerClick, hint: "demonstração" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Olá! Bem-vindo${organizationName ? ` — ${organizationName}` : ""}`}
        description="Acompanhe o desempenho das campanhas e a evolução da sua base de leads."
        action={
          <Button variant="brand" asChild>
            <Link to="/painel/campanhas">
              Nova campanha <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="Carregando indicadores..." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="card-elevated p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <card.icon className="size-4 text-brand" aria-hidden="true" />
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card-elevated p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Desempenho por mês</h2>
            <DemoBadge />
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demoPerformance}>
                <defs>
                  <linearGradient id="gAb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gCl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="aberturas"
                  stroke="var(--color-brand)"
                  fill="url(#gAb)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="cliques"
                  stroke="var(--color-success)"
                  fill="url(#gCl)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Volume por canal</h2>
            <DemoBadge />
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoChannels}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="canal" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="volume" fill="var(--color-brand)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="card-elevated p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Atividade recente</h2>
          <DemoBadge />
        </div>
        <ul className="mt-4 divide-y divide-border">
          {demoActivity.map((item) => (
            <li key={item.titulo} className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm text-foreground">{item.titulo}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{item.quando}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}