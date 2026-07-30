import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/public/LegalLayout";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de Cookies | CampaignPilot" },
      {
        name: "description",
        content:
          "Entenda quais cookies e tecnologias semelhantes o CampaignPilot utiliza e como gerenciá-los.",
      },
      { property: "og:title", content: "Política de Cookies | CampaignPilot" },
      { property: "og:description", content: "Cookies utilizados e como gerenciá-los." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://campaignpilot.com.br/cookies" }],
  }),
  component: Cookies,
});

function Cookies() {
  return (
    <LegalLayout
      title="Política de Cookies"
      updatedAt="29 de julho de 2026"
      intro="Utilizamos o mínimo necessário de cookies e armazenamento local para operar a plataforma com segurança."
    >
      <LegalSection title="1. Cookies estritamente necessários">
        <p>
          Utilizados para autenticação, manutenção da sessão e proteção contra requisições forjadas
          (CSRF). Sem eles a plataforma não funciona. Quando aplicável, são marcados como{" "}
          <strong>Secure</strong>, <strong>HttpOnly</strong> e <strong>SameSite</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Armazenamento local">
        <p>
          Utilizamos armazenamento local do navegador para manter a sessão autenticada e para
          limitar tentativas repetidas em formulários públicos (proteção anti-abuso).
        </p>
      </LegalSection>

      <LegalSection title="3. Cookies analíticos e de marketing">
        <p>
          Nesta versão não utilizamos cookies de publicidade nem rastreadores de terceiros. Caso
          sejam adotados, um banner de consentimento será apresentado antes da ativação.
        </p>
      </LegalSection>

      <LegalSection title="4. Como gerenciar">
        <p>
          Você pode bloquear ou remover cookies nas configurações do navegador. O bloqueio de
          cookies necessários impede o login e o uso do painel.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}