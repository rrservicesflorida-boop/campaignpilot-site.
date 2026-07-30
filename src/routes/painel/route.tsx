import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Puzzle,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/painel/PainelStates";
import { useAuth } from "@/hooks/useAuth";
import { roleLabels, useOrganization } from "@/hooks/useOrganization";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel | CampaignPilot" },
      { name: "description", content: "Área autenticada do CampaignPilot." },
      { property: "og:title", content: "Painel | CampaignPilot" },
      { property: "og:description", content: "Área autenticada do CampaignPilot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PainelLayout,
});

const navItems = [
  { to: "/painel", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/painel/leads", label: "Leads", icon: Users },
  { to: "/painel/listas", label: "Listas e segmentos", icon: ListChecks },
  { to: "/painel/campanhas", label: "Campanhas", icon: BarChart3 },
  { to: "/painel/integracoes", label: "Integrações", icon: Puzzle },
  { to: "/painel/configuracoes", label: "Configurações", icon: Settings },
];

function PainelLayout() {
  const navigate = useNavigate();
  const { session, loading, signOut, user } = useAuth();
  const { organizationName, role, isPlatformAdmin, loading: orgLoading } = useOrganization();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/entrar" });
  }, [loading, session, navigate]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-8">
        <LoadingState label="Verificando sua sessão..." />
      </div>
    );
  }

  const items = isPlatformAdmin
    ? [...navItems, { to: "/painel/admin", label: "Administração", icon: Shield }]
    : navItems;

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[268px_1fr]">
      <aside
        className={cn(
          "z-40 flex-col justify-between bg-sidebar px-4 py-6 text-sidebar-foreground lg:sticky lg:top-0 lg:flex lg:h-screen",
          menuOpen ? "fixed inset-0 flex" : "hidden",
        )}
      >
        <div>
          <div className="flex items-center justify-between">
            <Logo tone="dark" />
            <button
              type="button"
              className="rounded-lg p-2 lg:hidden"
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-sidebar-border bg-sidebar-accent p-3">
            <p className="text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
              Organização
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-sidebar-accent-foreground">
              {orgLoading ? "Carregando..." : (organizationName ?? "Sem organização")}
            </p>
            <p className="mt-0.5 text-xs text-sidebar-foreground/60">
              {role ? roleLabels[role] : "—"}
              {isPlatformAdmin ? " · Admin da plataforma" : ""}
            </p>
          </div>

          <nav className="mt-6 space-y-1" aria-label="Navegação do painel">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: Boolean((item as { exact?: boolean }).exact) }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground"
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 space-y-3">
          <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
          <Button
            variant="heroOutline"
            className="w-full justify-start"
            onClick={async () => {
              await signOut();
              navigate({ to: "/entrar" });
            }}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
          <Logo />
          <button
            type="button"
            className="rounded-lg border border-border p-2"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}