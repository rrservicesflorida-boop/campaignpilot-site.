import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { isValidEmail, normalizeEmail, throttleKey } from "@/lib/sanitize";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha | CampaignPilot" },
      {
        name: "description",
        content: "Solicite o link de redefinição de senha da sua conta CampaignPilot.",
      },
      { property: "og:title", content: "Recuperar senha | CampaignPilot" },
      { property: "og:description", content: "Redefina o acesso à sua conta CampaignPilot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RecuperarSenha,
});

function RecuperarSenha() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = normalizeEmail(new FormData(event.currentTarget).get("email"));
    if (!isValidEmail(email)) return toast.error("Informe um e-mail válido.");
    if (!throttleKey("recuperar", 3, 10 * 60 * 1000)) {
      return toast.error("Muitas solicitações. Aguarde alguns minutos.");
    }

    setBusy(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setBusy(false);
    // Resposta idêntica exista ou não a conta.
    setSent(true);
  }

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Enviaremos um link seguro para redefinir sua senha."
      footer={
        <Link to="/entrar" className="font-medium text-brand hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
          Se houver uma conta associada a esse e-mail, o link de redefinição será enviado em alguns
          instantes. Verifique também a caixa de spam.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail cadastrado</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <Button type="submit" variant="brand" size="lg" disabled={busy}>
            {busy ? "Enviando..." : "Enviar link de redefinição"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}