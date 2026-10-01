import { Link } from "react-router-dom";

type LegalDocument = "privacy" | "terms";

interface LegalSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

const documents: Record<LegalDocument, { title: string; intro: string; sections: LegalSection[] }> =
  {
    privacy: {
      title: "Política de Privacidade",
      intro:
        "Esta política explica como a PetDog's Estética Animal trata dados pessoais ao oferecer cadastro, agendamento e atendimento. Leia também os Termos de Uso.",
      sections: [
        {
          title: "Dados tratados",
          paragraphs: [
            "Podemos tratar os dados necessários para manter sua conta e organizar o atendimento:",
          ],
          bullets: [
            "Identificação e contato: nome, e-mail, telefone e foto de perfil, quando fornecidos.",
            "Conta e segurança: credenciais de acesso e informações técnicas necessárias para autenticar e proteger a sessão.",
            "Agendamento e atendimento: pet, serviço, profissional, data, horário e situação do agendamento.",
            "Dados do pet: nome, raça, idade, porte e foto, quando informados no cadastro.",
            "Dados profissionais: especialidade e horários de trabalho dos profissionais cadastrados.",
          ],
        },
        {
          title: "Finalidades e bases legais",
          paragraphs: [
            "Usamos os dados para criar e administrar contas, consultar disponibilidade, marcar e gerenciar atendimentos, prestar suporte e proteger o serviço contra uso indevido.",
            "O tratamento pode ser necessário para procedimentos relacionados ao atendimento solicitado e à execução dos serviços, para cumprir obrigações legais e para interesses legítimos de segurança e operação, respeitados os direitos da pessoa titular. Quando uma atividade depender de consentimento, ele será solicitado de forma específica.",
          ],
        },
        {
          title: "Compartilhamento",
          paragraphs: [
            "Os dados podem ser acessados por administradores e profissionais envolvidos no atendimento e por fornecedores que operam infraestrutura, comunicação ou envio de e-mails em nome da PetDog's. O acesso deve ser limitado ao necessário para essas atividades.",
            "Não vendemos dados pessoais. Informações também podem ser compartilhadas quando exigido por lei ou necessário para exercício regular de direitos.",
          ],
        },
        {
          title: "Armazenamento e segurança",
          paragraphs: [
            "O navegador mantém localmente o token de sessão e dados básicos do usuário para que o acesso continue funcionando. Encerre a sessão em dispositivos compartilhados. Dados de cadastro e atendimento são processados pelo backend do serviço.",
            "Aplicamos medidas técnicas e administrativas compatíveis com o serviço. Nenhum sistema é completamente livre de riscos; comunique a unidade se suspeitar de acesso indevido à sua conta.",
          ],
        },
        {
          title: "Retenção e direitos",
          paragraphs: [
            "Os dados são mantidos pelo período necessário às finalidades do atendimento e pelo tempo exigido para cumprir obrigações legais ou resguardar direitos. Prazos específicos dependem das obrigações aplicáveis à operação.",
            "Nos termos da LGPD, você pode solicitar confirmação e acesso aos dados, correção, informação sobre compartilhamento, anonimização, bloqueio ou eliminação quando cabível, portabilidade nos limites legais e revisão de decisões automatizadas, além de revogar consentimentos quando aplicável.",
            "Para exercer seus direitos ou tirar dúvidas, fale com a equipe da PetDog's Estética Animal pelo canal oficial de atendimento da unidade em Atibaia/SP.",
          ],
        },
        {
          title: "Atualizações e contato",
          paragraphs: [
            "Esta política pode ser atualizada para refletir mudanças no serviço ou nas práticas de tratamento. A versão vigente ficará disponível nesta página. Em caso de dúvida, utilize o canal oficial de atendimento da unidade.",
          ],
        },
      ],
    },
    terms: {
      title: "Termos de Uso",
      intro:
        "Estes termos orientam o uso do sistema PetDog's Estética Animal para cadastro, consulta de disponibilidade e organização de atendimentos.",
      sections: [
        {
          title: "Conta e acesso",
          paragraphs: [
            "Informe dados corretos e mantenha suas credenciais em sigilo. Você é responsável pelas atividades realizadas na sua conta e deve avisar a unidade se suspeitar de uso não autorizado.",
            "Contas criadas pela administração podem exigir a troca da senha provisória no primeiro acesso. O acesso às demais áreas só é liberado depois dessa troca.",
          ],
        },
        {
          title: "Agendamentos",
          paragraphs: [
            "A disponibilidade exibida pode mudar até a confirmação do agendamento. A solicitação só é concluída após o sistema confirmar o horário escolhido.",
            "Confira os dados do pet e do atendimento antes de confirmar. Alterações, cancelamentos, valores e condições específicas devem seguir as informações fornecidas pela unidade no momento do atendimento.",
          ],
        },
        {
          title: "Responsabilidades",
          paragraphs: [
            "Use o sistema de forma lícita e forneça informações necessárias para organizar o atendimento. A pessoa responsável pelo pet deve informar à equipe características ou necessidades relevantes para a prestação segura do serviço.",
            "Não tente acessar contas de terceiros, interferir no funcionamento do sistema ou enviar conteúdo malicioso.",
          ],
        },
        {
          title: "Privacidade e disponibilidade",
          paragraphs: [
            "O tratamento de dados pessoais é descrito na Política de Privacidade, que integra estes termos. O serviço pode ficar temporariamente indisponível para manutenção, atualizações ou motivos técnicos.",
            "Estes termos não substituem as condições de atendimento e consumo aplicáveis ao serviço contratado. Em caso de divergência, prevalecem os direitos previstos na legislação brasileira.",
          ],
        },
        {
          title: "Alterações e contato",
          paragraphs: [
            "Os termos podem ser atualizados quando o serviço ou suas regras mudarem. A versão atual estará disponível nesta página. Para dúvidas, entre em contato pelo canal oficial de atendimento da PetDog's Estética Animal, em Atibaia/SP.",
          ],
        },
      ],
    },
  };

export function LegalPage({ document }: { document: LegalDocument }) {
  const page = documents[document];
  const otherDocumentTitle = document === "privacy" ? "Termos de Uso" : "Política de Privacidade";
  const otherDocumentPath = document === "privacy" ? "/termos-de-uso" : "/politica-de-privacidade";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="text-sm font-bold text-slate-900 hover:text-blue-700">
            PetDog's Estética Animal
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="font-medium text-slate-600 hover:text-blue-700" to={otherDocumentPath}>
              {otherDocumentTitle}
            </Link>
            <Link className="font-semibold text-blue-700 hover:text-blue-800" to="/login">
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          PetDog's · Atibaia/SP
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{page.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{page.intro}</p>

        <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
          {page.sections.map((section) => (
            <section key={section.title} className="py-6">
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link className="font-semibold text-blue-700 hover:text-blue-800" to={otherDocumentPath}>
            Ler {otherDocumentTitle.toLowerCase()}
          </Link>
          <Link className="text-slate-600 hover:text-slate-900" to="/login">
            Voltar ao acesso
          </Link>
        </footer>
      </article>
    </main>
  );
}
