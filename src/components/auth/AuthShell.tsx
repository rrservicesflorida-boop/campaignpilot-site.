import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="surface-hero hidden flex-col justify-between p-12 lg:flex">
        <Logo tone="dark" />
        <div>
          <h2 className="max-w-md text-3xl font-bold text-ink-foreground">
            Suas campanhas no piloto certo.
          </h2>
          <p className="mt-4 max-w-md text-ink-foreground/70">
            Campanhas, leads, segmentos e métricas em um ambiente multiempresa com isolamento de
            dados e trilha de auditoria.
          </p>
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink-foreground/20 bg-ink-foreground/10 px-3 py-1.5 text-xs text-ink-foreground/80">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Nenhum disparo real de e-mail ou WhatsApp nesta versão
          </p>
        </div>
        <p className="text-xs text-ink-foreground/50">© {new Date().getFullYear()} CampaignPilot</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-8 text-2xl font-bold text-foreground lg:mt-0">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
          <p className="mt-10 text-xs text-muted-foreground">
            Ao continuar, você concorda com os{" "}
            <Link to="/termos" className="text-brand hover:underline">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link to="/privacidade" className="text-brand hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}