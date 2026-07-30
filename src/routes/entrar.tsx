import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isValidEmail, normalizeEmail, throttleKey } from "@/lib/sanitize";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar | CampaignPilot" },
      {
        name: "description",
        content: "Acesse o painel do CampaignPilot para gerenciar campanhas, leads e resultados.",
      },
      { property: "og:title", content: "Entrar | CampaignPilot" },
      { property: "og:description", content: "Acesse o painel do CampaignPilot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/painel" });
  }, [loading, session, navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = normalizeEmail(data.get("email"));
    const password = String(data.get("senha") ?? "");

    if (!isValidEmail(email) || password.length < 8) {
      toast.error("Credenciais inválidas.");
      return;
    }
    if (!throttleKey("login", 5, 5 * 60 * 1000)) {
      toast.error("Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (error) {
      // Mensagem genérica: não revela se o e-mail existe.
      toast.error("Não foi possível entrar. Verifique suas credenciais e tente novamente.");
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/painel" });
  }

  return (
    <AuthShell
      title="Entrar na sua conta"
      subtitle="Use o e-mail e a senha cadastrados para acessar o painel."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="font-medium text-brand hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="senha">Senha</Label>
            <Link to="/recuperar-senha" className="text-xs text-brand hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <Input
            id="senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
          />
        </div>
        <Button type="submit" variant="brand" size="lg" disabled={busy}>
          {busy ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}