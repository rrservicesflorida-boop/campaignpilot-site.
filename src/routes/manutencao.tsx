import { createFileRoute } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/manutencao")({
  head: () => ({
    meta: [
      { title: "Manutenção programada | CampaignPilot" },
      {
        name: "description",
        content: "A plataforma CampaignPilot está em manutenção programada. Voltamos em breve.",
      },
      { property: "og:title", content: "Manutenção programada | CampaignPilot" },
      { property: "og:description", content: "Estamos em manutenção programada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Manutencao,
});

function Manutencao() {
  return (
    <div className="surface-hero flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo tone="dark" />
      <span className="mt-10 grid size-14 place-items-center rounded-2xl bg-ink-foreground/10 text-ink-foreground">
        <Wrench className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-bold text-ink-foreground">Manutenção programada</h1>
      <p className="mt-3 max-w-md text-ink-foreground/70">
        Estamos aplicando melhorias na plataforma. O acesso será restabelecido em instantes e nenhum
        dado é perdido durante a manutenção.
      </p>
    </div>
  );
}