function MetricCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/50">
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${accent}`}>{label}</span>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
    </div>
  )
}

export default MetricCard