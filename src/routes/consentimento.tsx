import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { isValidEmail, normalizeEmail, throttleKey } from "@/lib/sanitize";

const CONSENT_VERSION = "v1-2026-07";

export const Route = createFileRoute("/consentimento")({
  head: () => ({
    meta: [
      { title: "Consentimento de comunicações | CampaignPilot" },
      {
        name: "description",
        content:
          "Registre ou revogue o seu consentimento para receber comunicações do CampaignPilot, com data, origem e versão do texto.",
      },
      { property: "og:title", content: "Consentimento de comunicações | CampaignPilot" },
      {
        property: "og:description",
        content: "Gerencie seu consentimento para comunicações de marketing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://campaignpilot.com.br/consentimento" }],
  }),
  component: Consentimento,
});

function Consentimento() {
  const [granted, setGranted] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = normalizeEmail(new FormData(event.currentTarget).get("email"));
    if (!isValidEmail(email)) return toast.error("Informe um e-mail válido.");
    if (!throttleKey("consentimento", 4, 10 * 60 * 1000)) {
      return toast.error("Muitas solicitações. Aguarde alguns minutos.");
    }

    setBusy(true);
    const { error } = await supabase.from("consent_records").insert({
      email,
      granted,
      channel: "email",
      consent_version: CONSENT_VERSION,
      source: "pagina_consentimento",
    });
    setBusy(false);

    if (error) {
      toast.error("Não foi possível registrar sua escolha agora. Tente novamente mais tarde.");
      return;
    }
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Privacidade</p>
        <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
          Consentimento para comunicações
        </h1>
        <p className="mt-4 text-muted-foreground">
          Registramos data, origem e versão do texto de consentimento. Você pode revogar sua escolha
          a qualquer momento nesta mesma página. Versão atual do texto:{" "}
          <strong>{CONSENT_VERSION}</strong>.
        </p>

        {done ? (
          <div className="card-elevated mt-10 p-6">
            <h2 className="text-lg font-semibold text-foreground">Escolha registrada</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sua preferência foi armazenada com data e hora. Nesta versão da plataforma nenhum
              disparo real é realizado.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-elevated mt-10 grid gap-5 p-6 sm:p-8" noValidate>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Autorizo o CampaignPilot a enviar comunicações sobre novidades, conteúdos e ofertas da
              plataforma no e-mail informado, podendo revogar esta autorização a qualquer momento.
            </div>

            <div className="flex items-start gap-2.5">
              <Checkbox
                id="aceite"
                checked={granted}
                onCheckedChange={(value) => setGranted(value === true)}
              />
              <Label htmlFor="aceite" className="text-sm font-normal text-muted-foreground">
                {granted
                  ? "Sim, autorizo receber comunicações."
                  : "Não autorizo — registrar revogação do consentimento."}
              </Label>
            </div>

            <Button type="submit" variant="brand" size="lg" disabled={busy}>
              {busy ? "Registrando..." : "Registrar minha escolha"}
            </Button>
          </form>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}