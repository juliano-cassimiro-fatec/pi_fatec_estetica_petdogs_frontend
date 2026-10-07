export function AboutSection() {
  return (
    <section
      id="sobre"
      className="scroll-mt-8 border-y border-slate-100 bg-white px-4 py-16 sm:py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Sobre nós</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Uma história que começou em casa
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Dona Creusa começou a atender cães em casa em 2006, no mesmo ano em que sua filha
            nasceu. Desde então, a Estética PetDog&apos;s segue no mesmo local, recebendo cães e
            tutores da região.
          </p>
        </div>

        <div className="border-l-2 border-blue-200 pl-5 md:pl-7">
          <p className="text-5xl font-black text-blue-700">2006</p>
          <p className="mt-2 text-sm font-semibold text-slate-600">O início, em casa</p>
        </div>
      </div>
    </section>
  );
}
