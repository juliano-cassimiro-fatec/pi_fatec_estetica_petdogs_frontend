import { Link } from "react-router-dom";

export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <nav
      aria-label="Informações legais"
      className={`flex flex-wrap items-center gap-2 text-sm ${className}`}
    >
      <Link
        className="font-medium text-slate-500 transition hover:text-blue-700"
        to="/politica-de-privacidade"
      >
        Política de Privacidade
      </Link>
      <span className="text-slate-300" aria-hidden="true">
        ·
      </span>
      <Link
        className="font-medium text-slate-500 transition hover:text-blue-700"
        to="/termos-de-uso"
      >
        Termos de Uso
      </Link>
    </nav>
  );
}
