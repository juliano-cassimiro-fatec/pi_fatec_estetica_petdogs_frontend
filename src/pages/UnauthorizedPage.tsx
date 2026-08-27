import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_30px_80px_-50px_rgba(37,99,235,0.45)]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-2xl font-black text-blue-700">
          !
        </div>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
          Acesso não autorizado
        </h1>
        <p className="mt-3 text-slate-600">Você não tem permissão para acessar esta página.</p>
        <Link
          className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
          to="/"
        >
          Voltar
        </Link>
      </div>
    </main>
  );
}
