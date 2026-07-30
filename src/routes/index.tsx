import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Cog,
  Filter,
  Layers,
  LineChart,
  Lock,
  MessagesSquare,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";

import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { DemoBadge } from "@/components/public/DemoBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { isValidEmail, normalizeEmail, sanitizeText, throttleKey } from "@/lib/sanitize";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampaignPilot | Gestão de campanhas e leads em um só lugar" },
      {
        name: "description",
        content:
          "Crie, acompanhe e otimize campanhas de marketing com gestão de leads, segmentos, métricas em tempo real e segurança em conformidade com a LGPD.",
      },
      { property: "og:title", content: "CampaignPilot | Suas campanhas no piloto certo" },
      {
        property: "og:description",
        content:
          "Transforme contatos em oportunidades com campanhas inteligentes, automação e acompanhamento em tempo real.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://campaignpilot.com.br/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://campaignpilot.com.br/" }],
  }),
  component: Home,
});

const steps = [
  {
    icon: Users,
    title: "1. Centralize seus contatos",
    text: "Importe leads por CSV com validação e pré-visualização, ou cadastre manualmente com consentimento registrado.",
  },
  {
    icon: Layers,
    title: "2. Segmente públicos",
    text: "Crie listas e segmentos com filtros por status, origem, tags e responsável.",
  },
  {
    icon: Target,
    title: "3. Monte a campanha",
    text: "Assistente em etapas: informações, público, conteúdo, configuração, revisão, simulação e aprovação.",
  },
  {
    icon: LineChart,
    title: "4. Acompanhe resultados",
    text: "Painel com aberturas, cliques, conversões e histórico de alterações de cada campanha.",
  },
];

const benefits = [
  {
    icon: Sparkles,
    title: "Operação organizada",
    text: "Campanhas, listas e leads em um único fluxo, com papéis e permissões claras por organização.",
  },
  {
    icon: ShieldCheck,
    title: "Privacidade desde o início",
    text: "Consentimento versionado, registro de descadastro, lista de supressão e trilha de auditoria.",
  },
  {
    icon: Workflow,
    title: "Pronto para automação",
    text: "Arquitetura preparada para Vtiger CRM, n8n, provedores de e-mail e WhatsApp Business.",
  },
  {
    icon: BarChart3,
    title: "Decisões com dados",
    text: "Métricas por campanha e por período, com comparativos e alertas de configuração.",
  },
  {
    icon: Lock,
    title: "Isolamento multiempresa",
    text: "Cada organização enxerga apenas os próprios dados, com regras aplicadas no banco de dados.",
  },
  {
    icon: Activity,
    title: "Acompanhamento contínuo",
    text: "Atividades recentes, status das campanhas e notificações internas da equipe.",
  },
];

const leadFeatures = [
  "Cadastro manual, edição e histórico de atualização",
  "Pesquisa, filtros combinados e paginação",
  "Tags, status, origem e responsável",
  "Consentimento com data, origem e versão",
  "Registro de descadastro e lista de supressão",
  "Importação CSV com validação e pré-visualização",
  "Exportação restrita a perfis autorizados",
  "Detecção de contatos duplicados",
];

const integrations = [
  { name: "Vtiger CRM", text: "Sincronização de leads e oportunidades." },
  { name: "n8n", text: "Orquestração de fluxos e automações." },
  { name: "Provedor de e-mail", text: "Disparos transacionais e de marketing." },
  { name: "WhatsApp Business Cloud API", text: "Mensagens com modelos aprovados." },
  { name: "Webhooks", text: "Eventos enviados para sistemas externos." },
  { name: "API REST", text: "Integração sob medida com seu ecossistema." },
];

const securityItems = [
  "Row Level Security ativa em todas as tabelas com dados de clientes",
  "Papéis validados no banco de dados, não apenas na interface",
  "Trilha de auditoria de login, criação, alteração, exportação e exclusão",
  "Soft delete e confirmação obrigatória em exclusões importantes",
  "Cabeçalhos de segurança, CSP, HSTS e cookies protegidos",
  "Credenciais somente em variáveis de ambiente e cofre de segredos",
];

const plans = [
  {
    name: "Essencial",
    price: "R$ 149",
    tagline: "Para times iniciando a operação de campanhas.",
    items: ["Até 5.000 leads", "3 usuários", "Campanhas ilimitadas em simulação", "Relatórios básicos"],
  },
  {
    name: "Profissional",
    price: "R$ 389",
    tagline: "Para operações com múltiplos canais e segmentos.",
    items: [
      "Até 50.000 leads",
      "15 usuários",
      "Segmentos avançados e tags",
      "Trilha de auditoria completa",
      "Integrações (quando liberadas)",
    ],
    highlight: true,
  },
  {
    name: "Corporativo",
    price: "Sob consulta",
    tagline: "Para empresas com requisitos de governança.",
    items: ["Leads sob demanda", "Usuários ilimitados", "SSO e políticas dedicadas", "Suporte prioritário"],
  },
];

const faq = [
  {
    q: "O CampaignPilot envia e-mails ou mensagens de WhatsApp nesta versão?",
    a: "Não. Esta versão é de estruturação: todas as campanhas ficam em modo simulação e nenhum disparo real é executado. Os números exibidos são dados de demonstração.",
  },
  {
    q: "Como funciona o isolamento entre empresas?",
    a: "Cada empresa possui uma organização própria. Leads, listas, campanhas, relatórios e integrações são vinculados ao identificador da organização e protegidos por políticas de acesso aplicadas no próprio banco de dados.",
  },
  {
    q: "Quais perfis de acesso existem?",
    a: "Administrador, Gestor, Operador e Visualizador. As permissões são validadas no backend e no banco, não apenas na interface.",
  },
  {
    q: "Os textos legais já estão prontos para uso comercial?",
    a: "Os textos foram redigidos considerando a LGPD e boas práticas, mas devem ser revisados por um profissional jurídico antes do lançamento comercial.",
  },
  {
    q: "Posso importar minha base atual?",
    a: "Sim. A importação por CSV inclui validação de formato, pré-visualização das linhas e detecção de contatos duplicados antes de gravar.",
  },
];

function Home() {
  const [sending, setSending] = useState(false);

  async function handleContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot anti-bot: campo invisível que humanos não preenchem.
    if (String(data.get("empresa_site") ?? "").length > 0) {
      toast.success("Mensagem recebida.");
      form.reset();
      return;
    }

    const name = sanitizeText(data.get("nome"), 120);
    const email = normalizeEmail(data.get("email"));
    const message = sanitizeText(data.get("mensagem"), 2000);

    if (name.length < 2) return toast.error("Informe seu nome completo.");
    if (!isValidEmail(email)) return toast.error("Informe um e-mail válido.");
    if (message.length < 10) return toast.error("Descreva sua necessidade com mais detalhes.");
    if (!throttleKey("contato", 3, 10 * 60 * 1000)) {
      return toast.error("Muitas tentativas. Tente novamente em alguns minutos.");
    }

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      message,
      company: sanitizeText(data.get("empresa"), 120) || null,
    });
    setSending(false);

    if (error) {
      toast.error("Não foi possível enviar sua mensagem agora. Tente novamente mais tarde.");
      return;
    }
    toast.success("Mensagem registrada. Nossa equipe responderá em breve.");
    form.reset();
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main id="inicio">
        {/* HERO */}
        <section className="surface-hero relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/20 bg-ink-foreground/10 px-3 py-1 text-xs font-medium text-ink-foreground/85">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Suas campanhas no piloto certo.
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-[1.08] text-ink-foreground sm:text-5xl lg:text-[3.4rem]">
                Crie, acompanhe e otimize suas campanhas em um só lugar.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-ink-foreground/75">
                Transforme contatos em oportunidades com campanhas inteligentes, automação e
                acompanhamento em tempo real.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="brand" size="xl" asChild>
                  <Link to="/cadastro">Começar agora</Link>
                </Button>
                <Button variant="heroOutline" size="xl" asChild>
                  <a href="#painel">Ver demonstração</a>
                </Button>
              </div>
              <DemoBadge className="mt-8" />
            </div>

            <div className="animate-fade-up rounded-3xl border border-ink-foreground/15 bg-ink-foreground/5 p-4 backdrop-blur">
              <div className="rounded-2xl bg-card p-5 shadow-[0_30px_80px_oklch(0.12_0.05_258_/_0.45)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Visão geral</p>
                  <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success">
                    Demonstração
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { label: "Campanhas ativas", value: "6" },
                    { label: "Leads totais", value: "12.480" },
                    { label: "Taxa de abertura", value: "47,2%" },
                    { label: "Conversões", value: "318" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-xl border border-border bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      <p className="mt-1 font-display text-xl font-bold text-foreground">
                        {kpi.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex h-28 items-end gap-2 rounded-xl border border-border bg-muted/30 p-3">
                  {[38, 44, 41, 52, 47, 63, 58].map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-md bg-brand/80"
                      style={{ height: `${height}%` }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <Section id="como-funciona" eyebrow="Como funciona" title="Do contato ao resultado, em quatro passos">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article key={step.title} className="card-elevated p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </article>
            ))}
          </div>
        </Section>

        {/* BENEFÍCIOS */}
        <Section
          id="recursos"
          eyebrow="Recursos"
          title="Tudo que sua operação de marketing precisa"
          subtitle="Uma base sólida para crescer sem perder controle, rastreabilidade e conformidade."
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="card-elevated p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <benefit.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{benefit.text}</p>
              </article>
            ))}
          </div>
        </Section>

        {/* PAINEL DEMONSTRATIVO */}
        <section id="painel" className="surface-ink py-20">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">
              Painel demonstrativo
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold text-ink-foreground sm:text-4xl">
              Acompanhe campanhas, leads e desempenho em tempo real
            </h2>
            <p className="mt-4 max-w-2xl text-ink-foreground/70">
              Indicadores consolidados, campanhas recentes, atividades da equipe e alertas de
              configuração — tudo na primeira tela após o login.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Campanhas ativas", value: "6", note: "2 iniciadas nesta semana" },
                { label: "Campanhas programadas", value: "4", note: "Próxima em 3 dias" },
                { label: "Novos leads (30d)", value: "1.284", note: "+18% vs. período anterior" },
                { label: "Taxa de cliques", value: "18,6%", note: "Média das campanhas" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-ink-foreground/12 bg-ink-foreground/5 p-5"
                >
                  <p className="text-xs uppercase tracking-wide text-ink-foreground/60">
                    {item.label}
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold text-ink-foreground">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-ink-foreground/60">{item.note}</p>
                </div>
              ))}
            </div>
            <DemoBadge className="mt-8" />
          </div>
        </section>

        {/* LEADS */}
        <Section
          id="solucoes"
          eyebrow="Soluções"
          title="Gestão de leads pronta para operar"
          subtitle="Do primeiro contato ao descadastro, com rastreabilidade de consentimento."
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <ul className="grid gap-3 sm:grid-cols-2">
              {leadFeatures.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4 text-sm text-foreground"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="card-elevated p-6">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Filter className="size-4 text-brand" aria-hidden="true" />
                Segmentos e listas
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Combine filtros por status, origem, tags e responsável para montar públicos e
                reutilizá-los em campanhas.
              </p>
              <div className="mt-5 space-y-3">
                {[
                  { name: "Clientes inativos há 90 dias", count: "2.140 contatos" },
                  { name: "Leads qualificados — Sul", count: "846 contatos" },
                  { name: "Consentimento ativo — E-mail", count: "9.302 contatos" },
                ].map((segment) => (
                  <div
                    key={segment.name}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-foreground">{segment.name}</span>
                    <span className="text-xs text-muted-foreground">{segment.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* INTEGRAÇÕES */}
        <Section
          id="integracoes"
          eyebrow="Integrações futuras"
          title="Arquitetura preparada, ativação sob controle"
          subtitle="Nenhuma credencial é incluída nesta versão. Todos os conectores iniciam como “Não configurado”."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <article key={integration.name} className="card-elevated p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <Puzzle className="size-4" aria-hidden="true" />
                  </span>
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    Não configurado
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{integration.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{integration.text}</p>
              </article>
            ))}
          </div>
        </Section>

        {/* SEGURANÇA */}
        <section id="seguranca" className="py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">Segurança</p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                Proteção de dados como requisito, não como opcional
              </h2>
              <p className="mt-4 text-muted-foreground">
                O CampaignPilot foi desenhado com separação rigorosa entre organizações, validação de
                permissões no banco de dados e registro de auditoria das ações sensíveis.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <Link to="/privacidade">Política de Privacidade</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/termos">Termos de Uso</Link>
                </Button>
              </div>
            </div>
            <ul className="grid gap-3">
              {securityItems.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* PREÇOS */}
        <Section
          id="precos"
          eyebrow="Planos demonstrativos"
          title="Preços ilustrativos para validação da proposta"
          subtitle="Valores de demonstração. Nenhuma cobrança é processada nesta versão."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.highlight
                    ? "rounded-2xl border-2 border-brand bg-card p-7 shadow-[0_20px_60px_oklch(0.62_0.19_253_/_0.18)]"
                    : "card-elevated p-7"
                }
              >
                {plan.highlight ? (
                  <span className="mb-3 inline-block rounded-full bg-brand px-3 py-1 text-[11px] font-semibold text-brand-foreground">
                    Mais escolhido
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                <p className="mt-5 font-display text-3xl font-bold text-foreground">
                  {plan.price}
                  {plan.price.startsWith("R$") ? (
                    <span className="text-sm font-medium text-muted-foreground"> /mês</span>
                  ) : null}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.highlight ? "brand" : "outline"} className="mt-6 w-full" asChild>
                  <Link to="/cadastro">Começar agora</Link>
                </Button>
              </article>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" eyebrow="Perguntas frequentes" title="Dúvidas comuns sobre a plataforma">
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faq.map((item, index) => (
                <AccordionItem key={item.q} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>

        {/* CONTATO */}
        <Section
          id="contato"
          eyebrow="Contato"
          title="Fale com a equipe CampaignPilot"
          subtitle="Responderemos em até 2 dias úteis. Não utilizamos seus dados para disparos de marketing sem consentimento."
        >
          <form
            onSubmit={handleContact}
            className="card-elevated mx-auto grid max-w-3xl gap-4 p-6 sm:p-8"
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" name="nome" required maxLength={120} autoComplete="name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail corporativo</Label>
                <Input id="email" name="email" type="email" required maxLength={254} autoComplete="email" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="empresa">Empresa (opcional)</Label>
              <Input id="empresa" name="empresa" maxLength={120} autoComplete="organization" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mensagem">Como podemos ajudar?</Label>
              <Textarea id="mensagem" name="mensagem" rows={5} required maxLength={2000} />
            </div>
            <div aria-hidden="true" className="hidden">
              <label htmlFor="empresa_site">Não preencha este campo</label>
              <input id="empresa_site" name="empresa_site" tabIndex={-1} autoComplete="off" />
            </div>
            <p className="text-xs text-muted-foreground">
              Ao enviar, você concorda com a{" "}
              <Link to="/privacidade" className="text-brand underline-offset-4 hover:underline">
                Política de Privacidade
              </Link>
              .
            </p>
            <Button type="submit" variant="brand" size="lg" disabled={sending}>
              {sending ? "Enviando..." : "Enviar mensagem"}
            </Button>
          </form>
        </Section>

        <section className="mx-auto max-w-6xl px-4 pb-4">
          <div className="surface-hero flex flex-col items-start gap-5 rounded-3xl p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="text-2xl font-bold text-ink-foreground sm:text-3xl">
                Pronto para colocar suas campanhas no piloto certo?
              </h2>
              <p className="mt-2 text-ink-foreground/75">
                Crie sua conta e explore o painel com dados de demonstração.
              </p>
            </div>
            <Button variant="brand" size="xl" asChild>
              <Link to="/cadastro">Criar conta gratuita</Link>
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
        {subtitle ? <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p> : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

// Ícones reservados para uso futuro no painel público.
export const _icons = { ClipboardList, Cog, MessagesSquare };