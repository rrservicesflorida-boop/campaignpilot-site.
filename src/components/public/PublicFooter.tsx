import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

const columns = [
  {
    title: "Plataforma",
    items: [
      { label: "Recursos", to: "/#recursos" },
      { label: "Soluções", to: "/#solucoes" },
      { label: "Preços", to: "/#precos" },
      { label: "Perguntas frequentes", to: "/#faq" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Política de Privacidade", to: "/privacidade" },
      { label: "Termos de Uso", to: "/termos" },
      { label: "Política de Cookies", to: "/cookies" },
      { label: "Consentimento de comunicações", to: "/consentimento" },
      { label: "Exclusão de dados", to: "/exclusao-de-dados" },
    ],
  },
  {
    title: "Conta",
    items: [
      { label: "Entrar", to: "/entrar" },
      { label: "Criar conta", to: "/cadastro" },
      { label: "Recuperar senha", to: "/recuperar-senha" },
      { label: "Status do sistema", to: "/status" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="surface-ink mt-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo tone="dark" withSlogan />
          <p className="mt-4 max-w-xs text-sm text-ink-foreground/70">
            Plataforma brasileira de gestão de campanhas, leads e resultados. Versão de
            demonstração: nenhum disparo real de e-mail, SMS ou WhatsApp é executado.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-ink-foreground">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.items.map((item) => (
                <li key={item.label}>
                  {item.to.startsWith("/#") ? (
                    <a
                      href={item.to}
                      className="text-sm text-ink-foreground/70 transition-colors hover:text-ink-foreground"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.to}
                      className="text-sm text-ink-foreground/70 transition-colors hover:text-ink-foreground"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-ink-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CampaignPilot. Todos os direitos reservados.</p>
          <p>campaignpilot.com.br · Feito no Brasil · Conformidade com a LGPD em andamento</p>
        </div>
      </div>
    </footer>
  );
}