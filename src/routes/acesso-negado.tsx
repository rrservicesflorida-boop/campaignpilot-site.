import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/acesso-negado")({
  head: () => ({
    meta: [
      { title: "Acesso negado | CampaignPilot" },
      { name: "description", content: "Você não possui permissão para acessar esta área." },
      { property: "og:title", content: "Acesso negado | CampaignPilot" },
      { property: "og:description", content: "Permissão insuficiente para esta área." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AcessoNegado,
});

function AcessoNegado() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-foreground">Acesso negado</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sua conta não possui permissão para acessar esta área. Se você acredita que isso é um
          engano, fale com o administrador da sua organização.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/">Ir para o site</Link>
          </Button>
          <Button variant="brand" asChild>
            <Link to="/painel">Voltar ao painel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}