import { useState } from "react";
import type { Schedule } from "../../services/types";
import Icon from "../ui/Icon";
import { ScheduleMonthGrid } from "./ScheduleMonthGrid";
import { ScheduleDayList } from "./ScheduleDayList";
import { SchedulePrintReport } from "./SchedulePrintReport";
import { localDateKey } from "./scheduleUtils";
import { buttonClass, secondaryButtonClass } from "../dashboard/dashboardConfig";

type ReportPeriod = "month" | "day" | "year";

interface ScheduleCalendarProps {
  schedules: Schedule[];
  isAdmin: boolean;
  canEdit: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  canCreate: boolean;
  disabled?: boolean;
  onCreate: (date: string) => void;
  onEdit: (schedule: Schedule) => void;
  onConfirm: (schedule: Schedule) => void;
  onCancel: (schedule: Schedule) => void;
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
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("month");

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
  const reportSchedules = schedules
    .filter((schedule) => {
      const date = new Date(schedule.data_hora);
      if (Number.isNaN(date.getTime())) return false;
      if (reportPeriod === "day") return localDateKey(date) === selectedDate;
      if (reportPeriod === "year") return date.getFullYear() === month.getFullYear();
      return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
    })
    .sort(
      (first, second) => new Date(first.data_hora).getTime() - new Date(second.data_hora).getTime(),
    );
  const reportRangeLabel =
    reportPeriod === "day"
      ? selectedDateLabel
      : reportPeriod === "year"
        ? String(month.getFullYear())
        : monthLabel;
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
      <ScheduleMonthGrid
        month={month}
        monthLabel={monthLabel}
        schedulesByDay={schedulesByDay}
        selectedDate={selectedDate}
        disabled={disabled}
        onSelectDate={setSelectedDate}
        onMonthChange={setMonth}
      />

      <section className="border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold capitalize text-slate-900">{selectedDateLabel}</h3>
            <span className="text-xs text-slate-500">
              {selectedSchedules.length}{" "}
              {selectedSchedules.length === 1 ? "agendamento" : "agendamentos"}
            </span>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2">
              <div
                aria-label="Período do relatório"
                className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5"
                role="group"
              >
                {(
                  [
                    ["month", "Mês"],
                    ["day", "Dia"],
                    ["year", "Ano"],
                  ] as const
                ).map(([period, label]) => (
                  <button
                    aria-pressed={reportPeriod === period}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                      reportPeriod === period
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                    key={period}
                    onClick={() => setReportPeriod(period)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                aria-label="Imprimir relatório do período"
                className={secondaryButtonClass}
                disabled={!reportSchedules.length}
                onClick={() => window.print()}
                title={`Imprimir relatório de ${reportRangeLabel}`}
                type="button"
              >
                <Icon name="printer" className="mr-2 h-4 w-4" />
                Imprimir
              </button>
            </div>
          )}
        </header>

        <ScheduleDayList
          schedules={selectedSchedules}
          isAdmin={isAdmin}
          canEdit={canEdit}
          canConfirm={canConfirm}
          canCancel={canCancel}
          disabled={disabled}
          onEdit={onEdit}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />

        <button
          className={`${buttonClass} mt-4 w-full`}
          disabled={disabled || !canCreate}
          onClick={() => onCreate(selectedDate)}
          type="button"
        >
          Novo agendamento
        </button>
      </section>

      <SchedulePrintReport rangeLabel={reportRangeLabel} schedules={reportSchedules} />
    </section>
  );
}
