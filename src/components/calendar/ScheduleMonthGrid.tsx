import Icon from "../ui/Icon";
import { resolveImageUrl } from "../../services/uploads/imageUrl";
import type { Schedule } from "../../services/types";
import { getMonthDays, localDateKey, shiftMonth } from "./scheduleUtils";

interface ScheduleMonthGridProps {
  month: Date;
  monthLabel: string;
  schedulesByDay: Map<string, Schedule[]>;
  selectedDate: string;
  disabled: boolean;
  onSelectDate: (date: string) => void;
  onMonthChange: (month: Date) => void;
}

export function ScheduleMonthGrid({
  month,
  monthLabel,
  schedulesByDay,
  selectedDate,
  disabled,
  onSelectDate,
  onMonthChange,
}: ScheduleMonthGridProps) {
  const monthDays = getMonthDays(month);
  const todayKey = localDateKey(new Date());

  return (
    <div className="mx-auto w-full max-w-md">
      <header className="mb-3 flex items-center justify-between">
        <button
          aria-label="Mês anterior"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
          disabled={disabled}
          onClick={() => onMonthChange(shiftMonth(month, -1))}
          type="button"
        >
          ←
        </button>
        <h3 className="text-sm font-semibold capitalize text-slate-900">{monthLabel}</h3>
        <button
          aria-label="Próximo mês"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
          disabled={disabled}
          onClick={() => onMonthChange(shiftMonth(month, 1))}
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
          if (!date) {
            return <span aria-hidden="true" className="aspect-square" key={`empty-${index}`} />;
          }

          const key = localDateKey(date);
          const daySchedules = schedulesByDay.get(key) ?? [];
          const count = daySchedules.length;
          const selected = selectedDate === key;
          const today = todayKey === key;
          const dog = daySchedules[0]?.cao ?? daySchedules[0]?.animal;

          return (
            <button
              aria-label={`${date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}${count ? `, ${count} agendamentos` : ", sem agendamentos"}`}
              aria-pressed={selected}
              className={`relative flex aspect-square flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg text-sm transition ${
                selected
                  ? "bg-blue-600 font-semibold text-white"
                  : count
                    ? "bg-blue-50 font-semibold text-blue-700 hover:bg-blue-100"
                    : "text-slate-600 hover:bg-slate-100"
              } ${today && !selected ? "ring-1 ring-inset ring-slate-300" : ""}`}
              key={key}
              disabled={disabled}
              onClick={() => onSelectDate(key)}
              type="button"
            >
              <span className="leading-none">{date.getDate()}</span>
              {count > 0 && (
                <span className="flex h-4 items-center gap-0.5">
                  {dog?.foto ? (
                    <img
                      src={resolveImageUrl(dog.foto)}
                      alt=""
                      aria-hidden="true"
                      className="h-4 w-4 rounded-full object-cover ring-1 ring-white"
                    />
                  ) : (
                    <Icon
                      name="pets"
                      className={`h-3.5 w-3.5 ${selected ? "text-white" : "text-blue-500"}`}
                    />
                  )}
                  {count > 1 && (
                    <span className="text-[8px] font-semibold leading-none">+{count - 1}</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
