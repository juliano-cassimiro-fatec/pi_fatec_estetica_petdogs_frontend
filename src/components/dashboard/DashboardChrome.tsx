import type { AuthUser } from "../../features/shared/types";
import type { DashboardTab, TabKey } from "../../features/dashboard/dashboardConfig";
import { Avatar } from "../ui/Avatar";
import Icon from "../ui/Icon";
import MetricCard from "../ui/MetricCard";

interface DashboardHeaderProps {
  user: AuthUser | null;
  mode: { label: string; title: string; description: string };
}

function UserSummary({ user, label }: { user: AuthUser | null; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <Avatar src={user?.foto} alt={user?.name ?? "Usuário"} fallbackLabel={user?.name ?? "U"} />
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <p className="mt-1 truncate text-sm font-black text-slate-950">
          {user?.name ?? "Carregando"}
        </p>
        <p className="text-xs font-semibold text-slate-500">{user?.role ?? "..."}</p>
      </div>
    </div>
  );
}

export function HeaderUserSummary({ user, label }: { user: AuthUser | null; label: string }) {
  return (
    <div className="hidden sm:block">
      <UserSummary user={user} label={label} />
    </div>
  );
}

export function DashboardHeader({ user, mode }: DashboardHeaderProps) {
  return (
    <div className="border-b border-slate-200/70 bg-white/90 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[1.4rem] bg-gradient-to-br from-blue-600 via-sky-500 to-orange-400 text-white shadow-lg shadow-blue-200/60">
            <Icon name="cut" className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">
              Estética PetDogs
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {mode.title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 sm:text-base">{mode.description}</p>
          </div>
        </div>
        <div className="xl:hidden">
          <UserSummary user={user} label={mode.label} />
        </div>
      </div>
    </div>
  );
}

export function DashboardMetrics({
  schedules,
  services,
  professionals,
}: {
  schedules: number;
  services: number;
  professionals: number;
}) {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      <MetricCard label="Agendas" value={schedules} accent="bg-blue-100 text-blue-700" />
      <MetricCard label="Serviços" value={services} accent="bg-sky-100 text-sky-700" />
      <MetricCard label="Equipe" value={professionals} accent="bg-emerald-100 text-emerald-700" />
    </section>
  );
}

export function DashboardNavigation({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: DashboardTab[];
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <nav className="flex gap-2 overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-slate-50 p-2">
      {tabs
        .filter((tab) => tab.show)
        .map((tab) => (
          <button
            className={`inline-flex min-w-max items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${activeTab === tab.key ? "bg-blue-600 text-white shadow-sm" : "bg-transparent text-slate-600 hover:bg-white hover:text-slate-950"}`}
            key={tab.key}
            onClick={() => onChange(tab.key)}
          >
            <Icon name={tab.icon} className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
    </nav>
  );
}

export function DashboardFeedback({
  message,
  error,
  loading,
  onRetry,
}: {
  message: string;
  error: string;
  loading: boolean;
  onRetry?: () => void;
}) {
  return (
    <>
      {message && (
        <p
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-700 shadow-sm"
          role="status"
        >
          {message}
        </p>
      )}
      {error && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700 shadow-sm"
          role="alert"
        >
          <span>{error}</span>
          {onRetry && (
            <button
              type="button"
              className="rounded-xl border border-red-300 bg-white px-3 py-2 text-sm"
              onClick={onRetry}
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}
      {loading && (
        <p
          className="rounded-2xl bg-white p-4 font-semibold text-slate-600 shadow-sm"
          role="status"
          aria-live="polite"
        >
          Carregando dados do painel...
        </p>
      )}
    </>
  );
}
