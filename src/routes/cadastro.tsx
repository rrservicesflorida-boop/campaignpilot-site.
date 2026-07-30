import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { isValidEmail, normalizeEmail, sanitizeText, throttleKey } from "@/lib/sanitize";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta | CampaignPilot" },
      {
        name: "description",
        content:
          "Crie sua conta no CampaignPilot e organize campanhas, leads e métricas da sua empresa.",
      },
      { property: "og:title", content: "Criar conta | CampaignPilot" },
      { property: "og:description", content: "Crie sua conta no CampaignPilot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cadastro,
});

function Cadastro() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [accepted, setAccepted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    if (String(data.get("site_url") ?? "").length > 0) {
      setDone(true);
      return;
    }

    const fullName = sanitizeText(data.get("nome"), 120);
    const organization = sanitizeText(data.get("organizacao"), 120);
    const email = normalizeEmail(data.get("email"));
    const password = String(data.get("senha") ?? "");
    const confirm = String(data.get("confirmar") ?? "");

    if (fullName.length < 2) return toast.error("Informe seu nome completo.");
    if (!isValidEmail(email)) return toast.error("Informe um e-mail válido.");
    if (password.length < 8) return toast.error("A senha deve ter ao menos 8 caracteres.");
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return toast.error("A senha deve conter letras e números.");
    }
    if (password !== confirm) return toast.error("As senhas não coincidem.");
    if (!accepted) return toast.error("É necessário aceitar os termos e a política de privacidade.");
    if (!throttleKey("cadastro", 3, 10 * 60 * 1000)) {
      return toast.error("Muitas tentativas. Aguarde alguns minutos.");
    }

    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/painel`,
        data: { full_name: fullName, organization_name: organization || "Minha organização" },
      },
    });
    setBusy(false);

    if (error) {
      // Não confirmamos se o e-mail já existe.
      toast.error("Não foi possível concluir o cadastro agora. Tente novamente em instantes.");
      return;
    }
    setDone(true);
    form.reset();
  }

  if (done) {
    return (
      <AuthShell
        title="Confirme seu e-mail"
        subtitle="Se os dados informados forem válidos, você receberá uma mensagem com o link de confirmação."
        footer={
          <Link to="/entrar" className="font-medium text-brand hover:underline">
            Voltar para o login
          </Link>
        }
      >
        <div className="rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
          Após confirmar o e-mail, sua organização será criada automaticamente e você entrará como
          administrador dela.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Criar sua conta"
      subtitle="Leva menos de um minuto. Sua organização é criada automaticamente."
      footer={
        <>
          Já tem uma conta?{" "}
          <Link to="/entrar" className="font-medium text-brand hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div className="grid gap-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" name="nome" autoComplete="name" maxLength={120} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="organizacao">Nome da empresa</Label>
          <Input
            id="organizacao"
            name="organizacao"
            autoComplete="organization"
            maxLength={120}
            placeholder="Minha organização"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail corporativo</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmar">Confirmar senha</Label>
            <Input
              id="confirmar"
              name="confirmar"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Mínimo de 8 caracteres, com letras e números.
        </p>
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="aceite"
            checked={accepted}
            onCheckedChange={(value) => setAccepted(value === true)}
          />
          <Label htmlFor="aceite" className="text-xs font-normal leading-relaxed text-muted-foreground">
            Li e aceito os Termos de Uso e a Política de Privacidade, e autorizo o tratamento dos
            meus dados para criação e gestão da conta.
          </Label>
        </div>
        <div aria-hidden="true" className="hidden">
          <label htmlFor="site_url">Não preencha</label>
          <input id="site_url" name="site_url" tabIndex={-1} autoComplete="off" />
        </div>
        <Button type="submit" variant="brand" size="lg" disabled={busy}>
          {busy ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </AuthShell>
  );
}