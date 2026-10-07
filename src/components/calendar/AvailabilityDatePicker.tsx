import type { DayAvailability } from "../../services/types";
import { dateKey, getCalendarDays, addMonths } from "./availabilityCalendarUtils";

interface AvailabilityDatePickerProps {
  month: Date;
  daysMap: Map<string, DayAvailability>;
  selectedDate: string;
  loading: boolean;
  disabled: boolean;
  onMonthChange: (month: Date) => void;
  onSelectDay: (date: Date) => void;
}

export function AvailabilityDatePicker({
  month,
  daysMap,
  selectedDate,
  loading,
  disabled,
  onMonthChange,
  onSelectDay,
}: AvailabilityDatePickerProps) {
  const monthName = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(month);
  const calendarDays = getCalendarDays(month);

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          disabled={disabled || loading}
          aria-label="Mês anterior"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl leading-none text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ←
        </button>

        <div className="text-center">
          <h3 className="text-sm font-semibold capitalize text-slate-900">{monthName}</h3>
          <p className="text-xs text-slate-500" aria-live="polite">
            {loading ? "Buscando disponibilidade..." : "Selecione uma data"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          disabled={disabled || loading}
          aria-label="Próximo mês"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl leading-none text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 text-center">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <span
            key={day}
            className="py-1.5 text-[10px] font-semibold text-slate-400 sm:text-[11px]"
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="aspect-square" />;

          const key = dateKey(date);
          const available = daysMap.get(key)?.available === true;
          const selected = selectedDate === key;
          const today = dateKey(new Date()) === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(date)}
              disabled={disabled || loading || !available}
              aria-label={date.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              aria-pressed={selected}
              className={`relative flex aspect-square items-center justify-center rounded-lg text-sm transition ${
                selected
                  ? "bg-blue-600 font-semibold text-white"
                  : available
                    ? "bg-blue-50 font-medium text-blue-700 hover:bg-blue-100"
                    : "text-slate-300"
              } ${today && !selected ? "ring-1 ring-inset ring-slate-300" : ""}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
