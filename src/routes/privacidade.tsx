import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/public/LegalLayout";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade | CampaignPilot" },
      {
        name: "description",
        content:
          "Saiba como o CampaignPilot coleta, utiliza, armazena e protege dados pessoais em conformidade com a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade | CampaignPilot" },
      {
        property: "og:description",
        content: "Tratamento de dados pessoais, direitos do titular e segurança da informação.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://campaignpilot.com.br/privacidade" }],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <LegalLayout
      title="Política de Privacidade"
      updatedAt="29 de julho de 2026"
      intro="Esta política descreve como o CampaignPilot trata dados pessoais de visitantes, usuários da plataforma e contatos cadastrados pelos clientes."
    >
      <LegalSection title="1. Quem é o controlador">
        <p>
          O CampaignPilot atua como <strong>controlador</strong> dos dados de seus usuários (conta,
          organização, faturamento e uso da plataforma) e como <strong>operador</strong> dos dados
          de contatos e leads inseridos pelos clientes em suas próprias organizações.
        </p>
        <p>Contato do encarregado (DPO): privacidade@campaignpilot.com.br.</p>
      </LegalSection>

      <LegalSection title="2. Dados coletados">
        <p>Dados de conta: nome, e-mail, empresa, telefone opcional e registros de acesso.</p>
        <p>
          Dados de uso: endereço IP, data e hora de ações relevantes, agente do navegador e eventos
          de auditoria (login, criação, alteração, exportação e exclusão).
        </p>
        <p>
          Dados de leads: informações inseridas ou importadas pelo cliente, incluindo nome, e-mail,
          telefone, empresa, origem, tags e o registro de consentimento correspondente.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalidades e bases legais">
        <p>Execução de contrato: criação e manutenção da conta, suporte e prestação do serviço.</p>
        <p>
          Legítimo interesse: segurança da informação, prevenção a fraudes, auditoria e melhoria da
          plataforma.
        </p>
        <p>
          Consentimento: comunicações de marketing, quando aplicável, sempre com registro de data,
          origem e versão do texto aceito.
        </p>
        <p>Cumprimento de obrigação legal ou regulatória, quando exigido.</p>
      </LegalSection>

      <LegalSection title="4. Compartilhamento">
        <p>
          Não vendemos dados pessoais. O compartilhamento ocorre apenas com operadores necessários à
          prestação do serviço (hospedagem, banco de dados e, futuramente, provedores de envio),
          sempre sob contrato e com finalidade limitada.
        </p>
      </LegalSection>

      <LegalSection title="5. Retenção e exclusão">
        <p>
          Dados são mantidos enquanto a conta estiver ativa e pelos prazos legais aplicáveis.
          Exclusões na plataforma utilizam, sempre que possível, exclusão lógica (soft delete) com
          posterior eliminação definitiva.
        </p>
        <p>
          O titular pode solicitar a exclusão pela página de solicitação de exclusão de dados,
          disponível no rodapé do site.
        </p>
      </LegalSection>

      <LegalSection title="6. Direitos do titular">
        <p>
          Confirmação de tratamento, acesso, correção, anonimização, portabilidade, informação sobre
          compartilhamento, revogação de consentimento e oposição, nos termos dos artigos 17 a 22 da
          LGPD.
        </p>
      </LegalSection>

      <LegalSection title="7. Segurança">
        <p>
          Adotamos isolamento de dados por organização com políticas aplicadas no banco de dados,
          criptografia em trânsito (HTTPS/TLS), armazenamento de senhas apenas em formato de hash
          pelo provedor de autenticação, controle de papéis validado no servidor, registro de
          auditoria e cabeçalhos de segurança no navegador.
        </p>
      </LegalSection>

      <LegalSection title="8. Alterações">
        <p>
          Podemos atualizar esta política. Alterações relevantes serão comunicadas por e-mail ou
          aviso na plataforma, com indicação da nova data de vigência.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}