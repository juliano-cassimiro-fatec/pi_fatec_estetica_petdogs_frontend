import type { ReactNode } from "react";

function Field({
  label,
  hint,
  children,
  labelClassName = "grid gap-2 text-sm font-bold text-slate-700",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  labelClassName?: string;
}) {
  return (
    <label className={labelClassName}>
      <span>{label}</span>
      {children}
      {hint && <span className="text-xs font-medium text-slate-500">{hint}</span>}
    </label>
  );
}

export default Field;
