export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-xl font-black text-blue-600">PetDog's</h1>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Estetica Animal
            </p>
          </div>


          <a
            href="/login"
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Entrar
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-slate-50 px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Banho e Tosa • Atibaia/SP
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Cuidado e carinho para o seu pet.
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Banho e tosa com cuidado profissional para deixar seu pet limpo, confortável e bem
              cuidado.
            </p>
          </div>

          <img
            src="https://images.openai.com/static-rsc-4/LJSPtmjxOmiP-RU9CWs2yI3zWxPDRWAUUPHn-I3e53U1elp67IVp5Qvz_QRmwLB8S1Y2eOQBGoirkH_2TczCJhD3XXTmAbp7cw4m2WGqTcGo-EOzA4JYd7kA5bVqsJKitFkL_5Gmlht7ELxHPO-shdxsE0FAc0Ck5cMiVpPaFkJ-EwQEH2BsLH3x-J0XRd_e?purpose=fullsize"
            alt="Cachorro"
            className="h-[420px] w-full rounded-3xl object-cover"
          />
        </div>
      </section>
    </div>
  );
}
