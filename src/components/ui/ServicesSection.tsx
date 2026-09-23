import type { LandingService } from "../../services/landing/types";

type ServicesSectionProps = {
  services: LandingService[];
  loading?: boolean;
};

function ServiceSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="h-5 w-32 rounded bg-slate-200" />

      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-4/5 rounded bg-slate-100" />
      </div>

      <div className="mt-6 h-5 w-24 rounded bg-slate-200" />
    </div>
  );
}

function ServiceCard({ service }: { service: LandingService }) {
  return (
    <article className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600">
        🐾
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-900">{service.name}</h3>

      <p className="mt-3 leading-7 text-slate-600">{service.description}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {service.price && (
          <span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
            {service.price}
          </span>
        )}

        {service.duration && (
          <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">
            {service.duration}
          </span>
        )}

        {!service.price && !service.duration && (
          <span className="text-sm font-bold text-blue-600">Consulte valores</span>
        )}
      </div>
    </article>
  );
}

export function ServicesSection({ services, loading = false }: ServicesSectionProps) {
  return (
    <section id="servicos" className="bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Nossos serviços
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
            Tudo que seu pet precisa
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Serviços realizados com cuidado, atenção e carinho para garantir conforto e bem-estar ao
            seu pet.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => <ServiceSkeleton key={index} />)
            : services.map((service) => <ServiceCard key={service.id} service={service} />)}
        </div>
      </div>
    </section>
  );
}
