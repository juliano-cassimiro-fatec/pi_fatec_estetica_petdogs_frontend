import { useState } from "react";
import type { Schedule } from "../../features/shared/types";
import { getScheduleStatusPresentation } from "../../features/dashboard/dashboardConfig";
import {
  buttonClass,
  dangerButtonClass,
  secondaryButtonClass,
} from "../../features/dashboard/dashboardConfig";

interface ScheduleCalendarProps {
  schedules: Schedule[];
  isAdmin: boolean;
  canEdit: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  canCreate: boolean;
  disabled?: boolean;
  onCreate: () => void;
  onEdit: (schedule: Schedule) => void;
  onConfirm: (schedule: Schedule) => void;
  onCancel: (schedule: Schedule) => void;
}

const pad = (value: number) => String(value).padStart(2, "0");
const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const shiftMonth = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

function getMonthDays(month: Date) {
  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const lastDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days: (Date | null)[] = Array.from({ length: firstWeekday }, () => null);

  for (let day = 1; day <= lastDate; day += 1) {
    days.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  return days;
}

function formatTime(datetime: string) {
  return new Date(datetime).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ScheduleCalendar({
  schedules,
  isAdmin,
  canEdit,
  canConfirm,
  canCancel,
  canCreate,
  disabled = false,
  onCreate,
  onEdit,
  onConfirm,
  onCancel,
}: ScheduleCalendarProps) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));

  const monthDays = getMonthDays(month);
  const schedulesByDay = new Map<string, Schedule[]>();

  for (const schedule of schedules) {
    const date = new Date(schedule.data_hora);
    if (Number.isNaN(date.getTime())) continue;

    const key = localDateKey(date);
    const daySchedules = schedulesByDay.get(key) ?? [];
    daySchedules.push(schedule);
    schedulesByDay.set(key, daySchedules);
  }

  const selectedSchedules = [...(schedulesByDay.get(selectedDate) ?? [])].sort(
    (first, second) => new Date(first.data_hora).getTime() - new Date(second.data_hora).getTime(),
  );
  const selectedDateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(month);
  const todayKey = localDateKey(new Date());

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
      <div className="mx-auto w-full max-w-md">
        <header className="mb-3 flex items-center justify-between">
          <button
            aria-label="Mês anterior"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
            disabled={disabled}
            onClick={() => setMonth((current) => shiftMonth(current, -1))}
            type="button"
          >
            ←
          </button>
          <h3 className="text-sm font-semibold capitalize text-slate-900">{monthLabel}</h3>
          <button
            aria-label="Próximo mês"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
            disabled={disabled}
            onClick={() => setMonth((current) => shiftMonth(current, 1))}
            type="button"
          >
            →
          </button>
        </header>

        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((weekday) => (
            <span className="py-2" key={weekday}>
              {weekday}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((date, index) => {
            if (!date)
              return <span aria-hidden="true" className="aspect-square" key={`empty-${index}`} />;

            const key = localDateKey(date);
            const count = schedulesByDay.get(key)?.length ?? 0;
            const selected = selectedDate === key;
            const today = todayKey === key;

            return (
              <button
                aria-label={`${date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}${count ? `, ${count} agendamentos` : ", sem agendamentos"}`}
                aria-pressed={selected}
                className={`relative flex aspect-square items-center justify-center rounded-lg text-sm transition ${
                  selected
                    ? "bg-blue-600 font-semibold text-white"
                    : count
                      ? "bg-blue-50 font-semibold text-blue-700 hover:bg-blue-100"
                      : "text-slate-600 hover:bg-slate-100"
                } ${today && !selected ? "ring-1 ring-inset ring-slate-300" : ""}`}
                key={key}
                onClick={() => setSelectedDate(key)}
                type="button"
              >
                {date.getDate()}
                {count > 0 && !selected && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <section className="border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold capitalize text-slate-900">{selectedDateLabel}</h3>
          <span className="shrink-0 text-xs text-slate-500">
            {selectedSchedules.length}{" "}
            {selectedSchedules.length === 1 ? "agendamento" : "agendamentos"}
          </span>
        </header>

        {selectedSchedules.length === 0 ? (
          <div className="rounded-lg bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">Nenhum agendamento neste dia</p>
            <p className="mt-1 text-xs text-slate-500">
              Selecione outra data ou crie um novo horário.
            </p>
          </div>
        ) : (
          <div className="max-h-[25rem] space-y-2 overflow-y-auto pr-1">
            {selectedSchedules.map((schedule) => {
              const status = getScheduleStatusPresentation(schedule.status);

              return (
                <article
                  className={`rounded-lg border bg-white p-3 ${status.border}`}
                  key={schedule._id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatTime(schedule.data_hora)} · {schedule.animal?.nome ?? "Pet"}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-600">
                        {schedule.servico?.name ?? "Serviço"} ·{" "}
                        {schedule.profissional?.name ?? "Profissional"}
                      </p>
                      {isAdmin && schedule.cliente && (
                        <p className="mt-1 text-xs text-slate-500">
                          Cliente: {schedule.cliente.name}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${status.badge}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {(canEdit || canConfirm || canCancel) &&
                    (schedule.status === "agendado" || schedule.status === "confirmado") && (
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      {canEdit && (
                        <button
                          className={secondaryButtonClass}
                          disabled={disabled}
                          onClick={() => onEdit(schedule)}
                          type="button"
                        >
                          Editar
                        </button>
                      )}
                      {canConfirm && schedule.status === "agendado" && (
                        <button
                          className={buttonClass}
                          disabled={disabled}
                          onClick={() => onConfirm(schedule)}
                          type="button"
                        >
                          Confirmar
                        </button>
                      )}
                      {canCancel && (schedule.status === "agendado" || schedule.status === "confirmado") && (
                        <button
                          className={dangerButtonClass}
                          disabled={disabled}
                          onClick={() => onCancel(schedule)}
                          type="button"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <button
          className={`${buttonClass} mt-4 w-full`}
          disabled={disabled || !canCreate}
          onClick={onCreate}
          type="button"
        >
          Novo agendamento
        </button>
      </section>
    </section>
  );
}
