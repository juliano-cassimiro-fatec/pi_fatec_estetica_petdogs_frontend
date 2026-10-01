import { useEffect, useState } from "react";

import { ServicesSection } from "../../components/ui/ServicesSection";
import { LegalLinks } from "../../components/ui/LegalLinks";
import { landingPageService } from "../../services/landing/landingpageService";
import type { LandingService } from "../../services/landing/types";

const businessHours = [
  { day: "Segunda-feira", hours: "Fechado" },
  { day: "Terça-feira", hours: "08:00–17:00" },
  { day: "Quarta-feira", hours: "Fechado" },
  { day: "Quinta-feira", hours: "08:00–17:00" },
  { day: "Sexta-feira", hours: "08:00–17:00" },
  { day: "Sábado", hours: "Fechado" },
  { day: "Domingo", hours: "Fechado" },
];

const googleMapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Est%C3%A9tica%20PetDog%E2%80%99s%20Atibaia%20SP";
const officialWebsiteUrl = "https://esteticapetdogs.vercel.app/";

export function LandingPage() {
  const [services, setServices] = useState<LandingService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadLandingPage() {
      try {
        const data = await landingPageService.loadLandingPage();

        if (!mounted) {
          return;
        }

        setServices(data.services);
      } finally {
        if (mounted) {
          setLoadingServices(false);
        }
      }
    }

    void loadLandingPage().catch(() => {
      if (mounted) setServices([]);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-xl font-black text-blue-600">PetDog&apos;s</h1>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Estética Animal
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#servicos"
              className="hidden text-sm font-bold text-slate-600 transition hover:text-blue-600 sm:block"
            >
              Serviços
            </a>

            <a
              href="#unidade"
              className="hidden text-sm font-bold text-slate-600 transition hover:text-blue-600 sm:block"
            >
              Unidade
            </a>

            <a
              href="/login"
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Entrar
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-slate-50 px-4 py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Banho e Tosa • Vila Carvalho, Atibaia/SP
              </p>

              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                Cuidado e carinho para o seu pet.
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Banho e tosa com cuidado profissional para deixar seu pet limpo, confortável e bem
                cuidado.
              </p>

              <a
                className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
                href={googleMapsUrl}
                rel="noreferrer"
                target="_blank"
              >
                Nota 5,0 no Google · 20 avaliações
              </a>

              <div className="mt-8 flex flex-wrap gap-3">
               

                <a
                  href="/login"
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
                >
                  Agendar atendimento
                </a>
              </div>
            </div>

            <img
              src="https://images.openai.com/static-rsc-4/LJSPtmjxOmiP-RU9CWs2yI3zWxPDRWAUUPHn-I3e53U1elp67IVp5Qvz_QRmwLB8S1Y2eOQBGoirkH_2TczCJhD3XXTmAbp7cw4m2WGqTcGo-EOzA4JYd7kA5bVqsJKitFkL_5Gmlht7ELxHPO-shdxsE0FAc0Ck5cMiVpPaFkJ-EwQEH2BsLH3x-J0XRd_e?purpose=fullsize"
              alt="Cachorro"
              className="h-[420px] w-full rounded-3xl object-cover"
            />
          </div>
        </section>

        <ServicesSection services={services} loading={loadingServices} />

        <section id="unidade" className="scroll-mt-8 bg-slate-50 px-4 py-14 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-blue-700">Visite a unidade</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Estética PetDog&apos;s</h2>
              <address className="mt-4 max-w-md text-sm leading-6 text-slate-600 not-italic">
                R. Cap. João Alves do Amaral, 335
                <br />
                Vila Carvalho, Atibaia - SP, 12944-275
              </address>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                <a
                  className="font-semibold text-blue-700 hover:text-blue-800"
                  href="tel:+5511998112494"
                >
                  (11) 99811-2494
                </a>
                <a
                  className="font-semibold text-blue-700 hover:text-blue-800"
                  href={googleMapsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Como chegar
                </a>
                <a
                  className="font-semibold text-blue-700 hover:text-blue-800"
                  href={officialWebsiteUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Site oficial
                </a>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Perfil do Google: negócio acolhedor à comunidade LGBTQ+ e identificado como empresa
                de empreendedoras.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-6 md:border-t-0 md:border-l md:pl-10 md:pt-0">
              <h3 className="text-base font-semibold text-slate-900">Horários de funcionamento</h3>
              <dl className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
                {businessHours.map(({ day, hours }) => (
                  <div key={day} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-slate-600">{day}</dt>
                    <dd
                      className={
                        hours === "Fechado" ? "text-slate-400" : "font-medium text-slate-900"
                      }
                    >
                      {hours}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-slate-500">Nota 5,0 com 20 avaliações no Google.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-100 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">PetDog's Estética Animal · Atibaia/SP</p>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
