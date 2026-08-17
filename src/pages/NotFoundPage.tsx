import { Link } from "react-router-dom"

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f9ff] p-6 text-center">
      <div className="max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">Erro 404</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Página não encontrada</h1>
        <p className="mt-3 text-slate-600">O endereço informado não existe ou foi movido.</p>
        <Link className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white" to="/">Voltar ao início</Link>
      </div>
    </main>
  )
}
