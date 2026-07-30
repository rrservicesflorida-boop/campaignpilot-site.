import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Definir nova senha | CampaignPilot" },
      { name: "description", content: "Defina uma nova senha para sua conta CampaignPilot." },
      { property: "og:title", content: "Definir nova senha | CampaignPilot" },
      { property: "og:description", content: "Defina uma nova senha de acesso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RedefinirSenha,
});

function RedefinirSenha() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("senha") ?? "");
    const confirm = String(data.get("confirmar") ?? "");

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return toast.error("A senha deve ter ao menos 8 caracteres, com letras e números.");
    }
    if (password !== confirm) return toast.error("As senhas não coincidem.");

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      toast.error("Link inválido ou expirado. Solicite uma nova redefinição.");
      return;
    }
    toast.success("Senha atualizada com sucesso.");
    navigate({ to: "/painel" });
  }

  return (
    <AuthShell
      title="Definir nova senha"
      subtitle="Escolha uma senha forte e exclusiva para sua conta."
      footer={
        <Link to="/entrar" className="font-medium text-brand hover:underline">
          Voltar para o login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div className="grid gap-2">
          <Label htmlFor="senha">Nova senha</Label>
          <Input id="senha" name="senha" type="password" autoComplete="new-password" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmar">Confirmar nova senha</Label>
          <Input
            id="confirmar"
            name="confirmar"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <Button type="submit" variant="brand" size="lg" disabled={busy}>
          {busy ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
    </AuthShell>
  );
}