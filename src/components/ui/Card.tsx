import type {  ReactNode } from "react"
import Icon from "./Icon";

type IconName = "calendar" | "services" | "users" | "clients" | "pets" | "settings" | "dashboard" | "list" | "user" | "clock" | "cut"


function Card({ icon, title, description, children }: { icon?: IconName; title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/70 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        {icon && <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-700"><Icon name={icon} className="h-6 w-6" /></span>}
        <div>
          <h2 className="text-2xl font-black">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

export default Card