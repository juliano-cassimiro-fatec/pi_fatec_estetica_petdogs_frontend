import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PageContainer,
  SectionPad,
  SiteHeader,
  SiteShell,
} from "../../components/layout/UnifiedPageFrame";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { BenefitCard, FaqItem, ServiceCard } from "../../components/landing/LandingComponents";

const whatsappNumber = "5511998112494";
const whatsappMessage = encodeURIComponent(
  "Olá! Quero agendar banho e tosa na PetDog's Estetica Animal em Atibaia/SP.",
);
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

function buildWhatsAppLink(serviceName?: string) {
  const message = serviceName
    ? `Olá! Quero agendar ${serviceName} na PetDog's Estetica Animal em Atibaia/SP.`
    : "Olá! Quero agendar banho e tosa na PetDog's Estetica Animal em Atibaia/SP.";

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

const benefits = [
  {
    title: "Atendimento humanizado",
    text: "Cada pet recebe cuidado individual, com uma rotina pensada para reduzir estresse e aumentar conforto.",
    icon: <PawIcon />,
  },
  {
    title: "Ambiente seguro",
    text: "Estrutura organizada, higienizada e preparada para um atendimento calmo e profissional.",
    icon: <ShieldIcon />,
  },
  {
    title: "Produtos de qualidade",
    text: "Uso de itens selecionados para banho, pelagem, higiene e acabamento com mais segurança.",
    icon: <SparklesIcon />,
  },
  {
    title: "Profissionais especializados",
    text: "Equipe preparada para banho, tosa e finalização com atenção ao perfil de cada animal.",
    icon: <ScissorsIcon />,
  },
  {
    title: "Higiene e conforto",
    text: "Processo pensado para manter o pet limpo, confortável e bem cuidado do início ao fim.",
    icon: <HeartIcon />,
  },
  {
    title: "Horário agendado",
    text: "Atendimento com hora marcada para dar mais previsibilidade ao tutor e menos espera ao pet.",
    icon: <ClockIcon />,
  },
];

// Conteúdo editorial da landing; o catálogo operacional permanece no dashboard.
const services = [
  { title: "Banho", text: "Limpeza, hidratação e secagem com cuidado.", highlight: "Mais pedido" },
  { title: "Tosa", text: "Tosa higiênica e estética para cada raça.", highlight: "Profissional" },
  {
    title: "Pacote completo",
    text: "Banho + tosa no mesmo atendimento.",
    highlight: "Praticidade",
  },
];

const faqs = [
  {
    question: "A PetDog's atende quais animais em Atibaia/SP?",
    answer:
      "O foco principal da casa e o atendimento de caes e gatos que precisam de banho, tosa e cuidados de estetica animal com acompanhamento profissional.",
  },
  {
    question: "Como funciona o agendamento pelo WhatsApp?",
    answer:
      "O tutor clica no botao, envia uma mensagem e combina o melhor horario para banho e tosa de forma rapida e direta.",
  },
  {
    question: "O atendimento e com horario marcado?",
    answer:
      "Sim. O modelo com horario agendado ajuda a organizar melhor o fluxo, reduz espera e deixa a experiencia mais previsivel.",
  },
  {
    question: "A empresa atende pets com necessidades mais delicadas?",
    answer:
      "A proposta da PetDog's e oferecer cuidado individual, com atencao ao comportamento do pet e ao tipo de servico solicitado.",
  },
  {
    question: "Onde fica a PetDog's Estetica Animal?",
    answer:
      "A empresa atende na regiao de Atibaia/SP e a localizacao pode ser vista na secao de mapa desta landing page.",
  },
];

export function LandingPage() {
  useEffect(() => {
    const description =
      "PetDog's Estetica Animal em Atibaia/SP. Banho e tosa premium com atendimento humanizado e agendamento via WhatsApp.";
    document.title = "PetDog's Estetica Animal | Banho e Tosa em Atibaia/SP";

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };

    const existingScript = document.getElementById("faq-schema");
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = "faq-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <SiteShell>
      <SiteHeader
        rightAction={
          <>
            <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
              <a className="transition hover:text-blue-700" href="#beneficios">
                Beneficios
              </a>
              <a className="transition hover:text-blue-700" href="#servicos">
                Servicos
              </a>
              <a className="transition hover:text-blue-700" href="#faq">
                FAQ
              </a>
              <a className="transition hover:text-blue-700" href="#localizacao">
                Localizacao
              </a>
              <Link
                className="rounded-2xl border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                to="/app/dashboard"
              >
                Agendar pelo site
              </Link>
            </nav>
            <a
              className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition duration-300 hover:-translate-y-0.5 hover:bg-orange-600"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              Agendar no WhatsApp
            </a>
          </>
        }
      />

      <main id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,249,255,1))]" />
        <PageContainer className="grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:pb-24 lg:pt-16">
          <div className="relative z-10 flex flex-col gap-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Banho e tosa premium em Atibaia/SP
            </div>
            <div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Banho e Tosa com Cuidado Profissional em Atibaia
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Seu pet limpo, cheiroso e confortável com agendamento rápido.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-4 text-base font-black text-white shadow-[0_18px_40px_-18px_rgba(249,115,22,0.85)] transition duration-300 hover:-translate-y-0.5 hover:bg-orange-600"
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
              >
                Agendar no WhatsApp
              </a>
              <a
                className="inline-flex items-center justify-center rounded-2xl border border-blue-100 bg-white px-6 py-4 text-base font-black text-blue-700 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                href="#servicos"
              >
                Ver servicos
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Atendimento humanizado", "Horario agendado", "Qualidade premium"].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-blue-100 bg-white px-4 py-4 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-orange-200/40 blur-3xl" />
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-blue-200/50 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_100px_-50px_rgba(37,99,235,0.5)]">
              <div className="grid gap-3 p-4 sm:grid-cols-[1.4fr_0.9fr]">
                <div className="overflow-hidden rounded-[1.6rem]">
                  <img
                    className="h-full min-h-[320px] w-full object-cover transition duration-500"
                    src="https://images.pexels.com/photos/4587991/pexels-photo-4587991.jpeg?auto=compress&cs=tinysrgb&w=900"
                    alt="Cachorro feliz apos banho e tosa"
                    loading="eager"
                    width="900"
                    height="600"
                  />
                </div>
                <div className="grid gap-3">
                  <div className="overflow-hidden rounded-[1.5rem]">
                    <img
                      className="h-40 w-full object-cover transition duration-500 hover:scale-105"
                      src="https://images.pexels.com/photos/4587959/pexels-photo-4587959.jpeg?auto=compress&cs=tinysrgb&w=500"
                      alt="Pet com aspecto limpo e bem cuidado"
                      loading="lazy"
                      width="500"
                      height="320"
                    />
                  </div>
                  <div className="overflow-hidden rounded-[1.5rem]">
                    <img
                      className="h-40 w-full object-cover transition duration-500 hover:scale-105"
                      src="https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=500"
                      alt="Filhote observando a camera"
                      loading="lazy"
                      width="500"
                      height="320"
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 border-t border-slate-100 bg-white p-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">
                    Atibaia/SP
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Atendimento local com foco em conforto e confiança.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">
                    WhatsApp
                  </p>
                  <p className="mt-1 text-sm text-slate-600">Contato rápido para agendamento.</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">
                    Premium
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Identidade visual limpa e acolhedora.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </main>

      <SectionPad id="beneficios">
        <PageContainer>
          <SectionTitle
            eyebrow="Beneficios"
            title="Por que a experiencia faz diferenca"
            description="Detalhes pensados para transmitir cuidado e confiança."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {benefits.map((item) => (
              <BenefitCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
            ))}
          </div>
        </PageContainer>
      </SectionPad>

      <section id="servicos" className="bg-white py-16">
        <PageContainer>
          <SectionTitle
            eyebrow="Servicos"
            title="Tudo que seu pet precisa em um so lugar"
            description="Escolha o serviço ideal e agende de forma simples."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((item) => (
              <ServiceCard
                key={item.title}
                title={item.title}
                text={item.text}
                highlight={item.highlight}
                actionHref={buildWhatsAppLink(item.title)}
              />
            ))}
          </div>
        </PageContainer>
      </section>

      <SectionPad id="localizacao" className="bg-white">
        <PageContainer className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-8 shadow-sm">
            <SectionTitle
              eyebrow="Localizacao"
              title="Atibaia/SP com atendimento pensado para a regiao"
              description="A secao local ajuda no SEO e reforca a presenca da empresa na cidade."
            />
            <div className="mt-8 grid gap-4 text-sm text-slate-600">
              <div className="rounded-[1.4rem] border border-blue-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                  Endereco regional
                </p>
                <p className="mt-2 leading-6">Atibaia, SP</p>
              </div>
              <div className="rounded-[1.4rem] border border-blue-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                  Contato direto
                </p>
                <p className="mt-2 leading-6">WhatsApp: (11) 99811-2494</p>
              </div>
              <div className="rounded-[1.4rem] border border-blue-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                  Atendimento
                </p>
                <p className="mt-2 leading-6">
                  Banho, tosa e cuidados de estetica animal com foco em conforto.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-sm">
            <iframe
              title="Mapa de Atibaia, SP"
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Atibaia%20SP&output=embed"
            />
          </div>
        </PageContainer>
      </SectionPad>

      <SectionPad id="faq">
        <PageContainer>
          <SectionTitle
            eyebrow="FAQ"
            title="Perguntas frequentes sobre banho e tosa em Atibaia"
            description="Conteudo estruturado para ajudar o visitante e fortalecer a busca local."
          />
          <div className="mt-8 grid gap-4">
            {faqs.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </PageContainer>
      </SectionPad>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 px-6 py-14 text-center text-white shadow-[0_30px_80px_-40px_rgba(37,99,235,0.65)] sm:px-10">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Seu pet merece esse cuidado
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-white/85">
            Fale com a equipe para encontrar o melhor horário.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              className="rounded-2xl bg-white px-6 py-3 font-black text-blue-700 transition hover:bg-blue-50"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              Falar no WhatsApp
            </a>
            <a
              className="rounded-2xl border border-white/20 px-6 py-3 font-black text-white transition hover:bg-white/10"
              href="#top"
            >
              Voltar ao topo
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/80 bg-white py-10">
        <PageContainer className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">
              PetDog's Estetica Animal
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Atibaia/SP</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Banho e tosa premium com foco em confiança, bem-estar e contato rapido via WhatsApp.
            </p>
          </div>
          <div className="grid gap-3 text-sm font-semibold text-slate-600">
            <p>WhatsApp: (11) 99811-2494</p>
            <p>Redes sociais: Instagram, Facebook e TikTok</p>
            <p>Horario agendado para maior conforto do tutor e do pet.</p>
          </div>
        </PageContainer>
      </footer>

      <a
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-green-500 px-5 py-4 text-sm font-black text-white shadow-[0_18px_40px_-16px_rgba(34,197,94,0.85)] transition duration-300 hover:-translate-y-1 hover:bg-green-600"
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
      >
        <WhatsAppIcon />
        WhatsApp
      </a>
    </SiteShell>
  );
}

function PawIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 14c2.8 0 5 2.2 5 5v1H7v-1c0-2.8 2.2-5 5-5Z" />
      <circle cx="8" cy="8" r="1.6" />
      <circle cx="16" cy="8" r="1.6" />
      <circle cx="6" cy="12" r="1.3" />
      <circle cx="18" cy="12" r="1.3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 3 19 6v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 3v4M12 17v4M4 12h4M16 12h4" />
      <path d="m6 6 2 2m8 8 2 2m0-12-2 2m-8 8-2 2" />
      <path d="M12 8l1.2 2.8L16 12l-2.8 1.2L12 16l-1.2-2.8L8 12l2.8-1.2L12 8Z" />
    </svg>
  );
}

function ScissorsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="6" cy="7" r="2.5" />
      <circle cx="6" cy="17" r="2.5" />
      <path d="M8.5 8.5 21 21" />
      <path d="M8.5 15.5 21 3" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 21s-7-4.5-7-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 16.5 12 21 12 21Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.5 3.5A11.9 11.9 0 0 0 2 18.3L1 23l4.9-1A12 12 0 1 0 20.5 3.5Zm-8.5 18a9.5 9.5 0 0 1-4.9-1.4l-.4-.2-2.9.6.6-2.8-.2-.4A9.5 9.5 0 1 1 12 21.5Zm5.2-6.7c-.3-.1-1.8-.9-2-1s-.4-.1-.6.1-.7 1-1 1.2-.3.1-.6 0a7.7 7.7 0 0 1-2.3-1.4 8.8 8.8 0 0 1-1.6-2c-.2-.3 0-.5.1-.7l.5-.6c.1-.2.2-.4.3-.6s0-.4 0-.6-.6-1.4-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3A2.8 2.8 0 0 0 7 10.5a4.9 4.9 0 0 0 1 2.7 11.1 11.1 0 0 0 4.7 4.2c.7.3 1.3.5 1.7.6.7.2 1.4.2 1.8.1.6-.1 1.8-.7 2-1.4s.2-1.3.1-1.4-.3-.2-.6-.3Z" />
    </svg>
  );
}
