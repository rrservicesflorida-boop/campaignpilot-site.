import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Status do sistema | CampaignPilot" },
      {
        name: "description",
        content: "Disponibilidade dos serviços do CampaignPilot: site, autenticação, painel e integrações.",
      },
      { property: "og:title", content: "Status do sistema | CampaignPilot" },
      { property: "og:description", content: "Acompanhe a disponibilidade dos serviços." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Status,
});

const services = [
  { name: "Site público", state: "operacional" as const },
  { name: "Autenticação", state: "operacional" as const },
  { name: "Painel e banco de dados", state: "operacional" as const },
  { name: "Disparos de e-mail", state: "nao-ativado" as const },
  { name: "WhatsApp Business", state: "nao-ativado" as const },
  { name: "Integrações externas", state: "nao-ativado" as const },
];

function Status() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Status do sistema</h1>
        <p className="mt-3 text-muted-foreground">
          Indicador informativo. Serviços de envio permanecem desativados nesta fase do projeto.
        </p>
        <ul className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {services.map((service) => (
            <li key={service.name} className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-medium text-foreground">{service.name}</span>
              {service.state === "operacional" ? (
                <span className="inline-flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="size-4" aria-hidden="true" /> Operacional
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <CircleDashed className="size-4" aria-hidden="true" /> Não ativado
                </span>
              )}
            </li>
          ))}
        </ul>
      </main>
      <PublicFooter />
    </div>
  );
}