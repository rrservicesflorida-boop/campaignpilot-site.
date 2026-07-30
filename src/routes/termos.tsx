import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/public/LegalLayout";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso | CampaignPilot" },
      {
        name: "description",
        content:
          "Condições de uso da plataforma CampaignPilot: contas, responsabilidades, limitações e encerramento.",
      },
      { property: "og:title", content: "Termos de Uso | CampaignPilot" },
      { property: "og:description", content: "Condições de uso da plataforma CampaignPilot." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://campaignpilot.com.br/termos" }],
  }),
  component: Termos,
});

function Termos() {
  return (
    <LegalLayout
      title="Termos de Uso"
      updatedAt="29 de julho de 2026"
      intro="Estes termos regulam o acesso e o uso da plataforma CampaignPilot, disponível em campaignpilot.com.br."
    >
      <LegalSection title="1. Aceite">
        <p>
          Ao criar uma conta ou utilizar a plataforma, o usuário declara ter lido e aceito estes
          termos e a Política de Privacidade.
        </p>
      </LegalSection>

      <LegalSection title="2. Conta e credenciais">
        <p>
          O usuário é responsável pela veracidade dos dados informados e pela guarda de suas
          credenciais. Contas são pessoais e intransferíveis. O acesso pode ser bloqueado em caso de
          uso indevido ou suspeita de comprometimento.
        </p>
      </LegalSection>

      <LegalSection title="3. Estágio atual do serviço">
        <p>
          Nesta versão, a plataforma opera em modo de estruturação e simulação:{" "}
          <strong>nenhum disparo real de e-mail, SMS ou WhatsApp é executado</strong> e os
          indicadores exibidos são dados de demonstração.
        </p>
      </LegalSection>

      <LegalSection title="4. Uso aceitável">
        <p>
          É vedado utilizar a plataforma para envio de mensagens não solicitadas, importação de bases
          sem base legal adequada, tentativa de acesso a dados de outras organizações, engenharia
          reversa, sobrecarga intencional da infraestrutura ou qualquer atividade ilícita.
        </p>
      </LegalSection>

      <LegalSection title="5. Conteúdo do cliente">
        <p>
          Os dados inseridos permanecem de titularidade do cliente. O cliente declara possuir base
          legal para tratar os dados dos contatos que cadastra ou importa.
        </p>
      </LegalSection>

      <LegalSection title="6. Disponibilidade e suporte">
        <p>
          Buscamos alta disponibilidade, mas o serviço pode passar por manutenções programadas.
          Indicadores de status são publicados na página de status do sistema.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitação de responsabilidade">
        <p>
          Na máxima extensão permitida pela lei, a responsabilidade por danos indiretos, lucros
          cessantes ou perda de dados decorrente de uso indevido pelo cliente é excluída.
        </p>
      </LegalSection>

      <LegalSection title="8. Encerramento">
        <p>
          O cliente pode encerrar a conta a qualquer momento. Podemos suspender contas que violem
          estes termos, com aviso sempre que possível.
        </p>
      </LegalSection>

      <LegalSection title="9. Foro e legislação">
        <p>
          Aplica-se a legislação brasileira. Fica eleito o foro do domicílio do consumidor, quando
          aplicável, ou o foro da sede da empresa para relações entre pessoas jurídicas.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}