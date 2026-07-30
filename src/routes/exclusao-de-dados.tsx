import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { isValidEmail, normalizeEmail, sanitizeText, throttleKey } from "@/lib/sanitize";

export const Route = createFileRoute("/exclusao-de-dados")({
  head: () => ({
    meta: [
      { title: "Solicitar exclusão de dados | CampaignPilot" },
      {
        name: "description",
        content:
          "Solicite a exclusão dos seus dados pessoais tratados pelo CampaignPilot, conforme a LGPD.",
      },
      { property: "og:title", content: "Solicitar exclusão de dados | CampaignPilot" },
      { property: "og:description", content: "Exercite seu direito de exclusão de dados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://campaignpilot.com.br/exclusao-de-dados" }],
  }),
  component: ExclusaoDeDados,
});

function ExclusaoDeDados() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (String(data.get("website") ?? "").length > 0) return setDone(true);

    const email = normalizeEmail(data.get("email"));
    const fullName = sanitizeText(data.get("nome"), 120);
    const reason = sanitizeText(data.get("motivo"), 1000);

    if (!isValidEmail(email)) return toast.error("Informe um e-mail válido.");
    if (!throttleKey("exclusao", 3, 30 * 60 * 1000)) {
      return toast.error("Muitas solicitações. Aguarde alguns minutos.");
    }

    setBusy(true);
    const { error } = await supabase.from("data_deletion_requests").insert({
      email,
      full_name: fullName || null,
      reason: reason || null,
      status: "pendente",
    });
    setBusy(false);

    if (error) {
      toast.error("Não foi possível registrar a solicitação. Tente novamente mais tarde.");
      return;
    }
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">LGPD</p>
        <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
          Solicitação de exclusão de dados
        </h1>
        <p className="mt-4 text-muted-foreground">
          Ao receber a solicitação, confirmaremos sua identidade e responderemos em até 15 dias.
          Alguns dados podem ser mantidos por obrigação legal, conforme descrito na{" "}
          <Link to="/privacidade" className="text-brand hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>

        {done ? (
          <div className="card-elevated mt-10 p-6">
            <h2 className="text-lg font-semibold text-foreground">Solicitação registrada</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Se houver dados associados ao e-mail informado, entraremos em contato para confirmar a
              identidade e concluir o processo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-elevated mt-10 grid gap-5 p-6 sm:p-8" noValidate>
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" name="nome" maxLength={120} autoComplete="name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail associado aos dados</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="motivo">Motivo ou detalhes (opcional)</Label>
              <Textarea id="motivo" name="motivo" rows={4} maxLength={1000} />
            </div>
            <div aria-hidden="true" className="hidden">
              <label htmlFor="website">Não preencha</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <Button type="submit" variant="brand" size="lg" disabled={busy}>
              {busy ? "Enviando..." : "Solicitar exclusão"}
            </Button>
          </form>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}