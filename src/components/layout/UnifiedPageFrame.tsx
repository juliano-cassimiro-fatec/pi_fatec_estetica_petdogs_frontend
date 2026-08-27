import type { HTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

export function SiteShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#f4f9ff] text-slate-900">{children}</div>;
}

export function SiteHeader({ rightAction }: { rightAction?: ReactNode }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" to="/" aria-label="Ir para a página inicial">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-200/70">
            PD
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">
              PetDog's Estetica Animal
            </p>
            <p className="text-sm font-semibold text-slate-700">Atibaia/SP</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">{rightAction}</div>
      </div>
    </header>
  );
}

export function PageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function SectionPad({
  children,
  className = "",
  ...sectionProps
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLElement>) {
  return (
    <section className={`py-16 ${className}`} {...sectionProps}>
      {children}
    </section>
  );
}
