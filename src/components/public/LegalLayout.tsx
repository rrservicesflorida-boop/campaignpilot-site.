import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export function LegalLayout({
  title,
  updatedAt,
  intro,
  children,
}: {
  title: string;
  updatedAt: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Documento legal</p>
        <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Última atualização: {updatedAt}</p>
        <p className="mt-6 text-muted-foreground">{intro}</p>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" aria-hidden="true" />
          <p className="text-sm text-warning-foreground">
            Aviso: este texto é um modelo elaborado com base na LGPD (Lei nº 13.709/2018) e em boas
            práticas de privacidade. Ele deve ser revisado e adaptado por um profissional jurídico
            antes do lançamento comercial.
          </p>
        </div>

        <article className="mt-10 space-y-8">{children}</article>
      </main>
      <PublicFooter />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}