import type { Pet, Schedule } from "../../services/types";
import { getScheduleStatusPresentation } from "./dashboardConfig";
import { formatScheduleTime, getScheduleDog } from "../calendar/scheduleUtils";
import { buttonClass, dangerButtonClass, secondaryButtonClass } from "./dashboardConfig";
import Icon from "../ui/Icon";

interface AdminDashboardProps {
  dogs: Pet[];
  schedules: Schedule[];
  customerCount: number;
  saving: boolean;
  canCreateSchedule: boolean;
  onOpenDogs: () => void;
  onOpenSchedule: () => void;
  onOpenCalendar: () => void;
  onEditSchedule: (schedule: Schedule) => void;
  onConfirmSchedule: (schedule: Schedule) => void;
  onCancelSchedule: (schedule: Schedule) => void;
}

export function AdminDashboard({
  dogs,
  schedules,
  customerCount,
  saving,
  canCreateSchedule,
  onOpenDogs,
  onOpenSchedule,
  onOpenCalendar,
  onEditSchedule,
  onConfirmSchedule,
  onCancelSchedule,
}: AdminDashboardProps) {
  const now = new Date();
  const activeSchedules = schedules.filter((schedule) => {
    if (schedule.status === "cancelado" || schedule.status === "completo") return false;
    return !Number.isNaN(new Date(schedule.data_hora).getTime());
  });
  const todaysSchedules = activeSchedules.filter((schedule) => {
    const date = new Date(schedule.data_hora);
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  });
  const pendingSchedules = activeSchedules.filter(
    (schedule) => schedule.status === "agendado" || schedule.status === "pendente",
  );
  const upcomingSchedules = activeSchedules
    .filter((schedule) => new Date(schedule.data_hora).getTime() >= now.getTime())
    .sort(
      (first, second) =>
        new Date(first.data_hora).getTime() - new Date(second.data_hora).getTime(),
    )
    .slice(0, 5);

  const metrics = [
    { label: "Cães cadastrados", value: dogs.length, icon: "pets" as const, color: "blue" },
    {
      label: "Agendamentos hoje",
      value: todaysSchedules.length,
      icon: "calendar" as const,
      color: "violet",
    },
    {
      label: "Aguardando confirmação",
      value: pendingSchedules.length,
      icon: "clock" as const,
      color: "amber",
    },
    { label: "Clientes", value: customerCount, icon: "clients" as const, color: "emerald" },
  ];

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-6 text-white shadow-lg shadow-blue-200/60 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-100">
          Administração
        </p>
        <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Visão geral</h2>
            <p className="mt-2 max-w-xl text-sm text-blue-50 sm:text-base">
              Acompanhe os cães cadastrados e organize os atendimentos em um só lugar.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-white px-5 py-3 font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            disabled={saving || !canCreateSchedule}
            onClick={onOpenSchedule}
            type="button"
          >
            <Icon name="calendar" className="h-5 w-5" />
            Novo agendamento
          </button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
            key={metric.label}
          >
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                metric.color === "blue"
                  ? "bg-blue-50 text-blue-700"
                  : metric.color === "violet"
                    ? "bg-violet-50 text-violet-700"
                    : metric.color === "amber"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <Icon name={metric.icon} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                {metric.value}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.8fr)]">
        <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-950">Próximos agendamentos</h3>
              <p className="mt-1 text-sm text-slate-500">
                Os próximos atendimentos que precisam da sua atenção.
              </p>
            </div>
            <button className={secondaryButtonClass} onClick={onOpenCalendar} type="button">
              Ver agenda completa
            </button>
          </div>

          {upcomingSchedules.length > 0 ? (
            <div className="space-y-3">
              {upcomingSchedules.map((schedule) => {
                const status = getScheduleStatusPresentation(schedule.status);
                const dog = getScheduleDog(schedule);
                const date = new Date(schedule.data_hora);

                return (
                  <article
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200"
                    key={schedule._id}
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-950">{dog?.nome ?? "Cão"}</h4>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.badge}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {schedule.servico?.name ?? "Serviço"} ·{" "}
                          {schedule.profissional?.name ?? "Profissional"}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {date.toLocaleDateString("pt-BR", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                          })}{" "}
                          às {formatScheduleTime(schedule.data_hora)}
                          {schedule.cliente?.name ? ` · ${schedule.cliente.name}` : ""}
                        </p>
                      </div>
                      {schedule.status !== "completo" && schedule.status !== "cancelado" && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            className={secondaryButtonClass}
                            disabled={saving}
                            onClick={() => onEditSchedule(schedule)}
                            type="button"
                          >
                            Editar
                          </button>
                          {schedule.status === "agendado" && (
                            <button
                              className={buttonClass}
                              disabled={saving}
                              onClick={() => onConfirmSchedule(schedule)}
                              type="button"
                            >
                              Confirmar
                            </button>
                          )}
                          <button
                            className={dangerButtonClass}
                            disabled={saving}
                            onClick={() => onCancelSchedule(schedule)}
                            type="button"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
              <p className="font-semibold text-slate-700">Nenhum próximo agendamento</p>
              <p className="mt-1 text-sm text-slate-500">
                Quando houver novos atendimentos, eles aparecerão aqui.
              </p>
            </div>
          )}
        </section>

        <aside className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h3 className="text-xl font-black text-slate-950">Acesso rápido</h3>
            <p className="mt-1 text-sm text-slate-500">Atalhos para as tarefas mais comuns.</p>
          </div>
          <div className="space-y-3">
            <button
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/50"
              onClick={onOpenDogs}
              type="button"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-blue-700">
                <Icon name="pets" />
              </span>
              <span>
                <span className="block font-bold text-slate-900">Gerenciar cães</span>
                <span className="mt-0.5 block text-sm text-slate-500">
                  Consultar e atualizar cadastros
                </span>
              </span>
            </button>
            <button
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/50"
              onClick={onOpenCalendar}
              type="button"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-violet-700">
                <Icon name="calendar" />
              </span>
              <span>
                <span className="block font-bold text-slate-900">Gerenciar agenda</span>
                <span className="mt-0.5 block text-sm text-slate-500">
                  Acompanhar horários e atendimentos
                </span>
              </span>
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
