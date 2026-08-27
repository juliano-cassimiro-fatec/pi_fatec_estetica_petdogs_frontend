interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div>
      <span className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">
        {eyebrow}
      </span>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
    </div>
  );
}
