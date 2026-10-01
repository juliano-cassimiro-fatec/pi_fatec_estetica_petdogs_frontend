import { useEffect, useMemo, useState, useTransition } from "react";
import { availabilityService } from "../../services/availability/availabilityService";
import type {
  DayAvailability,
  Professional,
  Service,
  SlotAvailability,
} from "../../features/shared/types";

type ProfessionalOption = Pick<
  Professional,
  "_id" | "name" | "especialidade" | "horario_inicio" | "horario_fim"
>;

type ServiceOption = Pick<Service, "_id" | "name" | "duracao_min" | "preco">;

interface ScheduleValue {
  servico: string;
  profissional: string;
  data_hora: string;
}

interface CalendarProps {
  professionals: ProfessionalOption[];
  services: ServiceOption[];
  value: ScheduleValue;
  onChange: (next: ScheduleValue) => void;
  disabled?: boolean;
}

const pad = (value: number) => String(value).padStart(2, "0");

const monthKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function parseCalendarDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function localDateKeyFromValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateKey(date);
}

function isSameSlot(selectedValue: string, slotDatetime: string) {
  if (!selectedValue) return false;

  const selectedTime = new Date(selectedValue).getTime();
  const slotTime = new Date(slotDatetime).getTime();
  return Number.isFinite(selectedTime) && Number.isFinite(slotTime)
    ? selectedTime === slotTime
    : selectedValue === slotDatetime;
}

const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

function getDays(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const total = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const days: (Date | null)[] = [];

  for (let i = 0; i < first.getDay(); i++) {
    days.push(null);
  }

  for (let day = 1; day <= total; day++) {
    days.push(new Date(date.getFullYear(), date.getMonth(), day));
  }

  return days;
}

export function AvailabilityCalendar({
  professionals,
  services,
  value,
  onChange,
  disabled = false,
}: CalendarProps) {
  const [month, setMonth] = useState(() =>
    value.data_hora ? parseCalendarDate(value.data_hora) : new Date(),
  );

  const [selectedDate, setSelectedDate] = useState(() => localDateKeyFromValue(value.data_hora));

  const [days, setDays] = useState<DayAvailability[]>([]);
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [loadingDays, startLoadingDays] = useTransition();
  const [loadingSlots, startLoadingSlots] = useTransition();

  const ready = Boolean(value.profissional && value.servico);

  const daysMap = useMemo(
    () => new Map((ready ? days : []).map((day) => [day.date, day])),
    [days, ready],
  );
  const visibleSlots = ready && selectedDate ? slots : [];
  const availableSlots = visibleSlots.filter((slot) => slot.available);

  const calendarDays = useMemo(() => getDays(month), [month]);

  const monthName = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(month);

  useEffect(() => {
    if (!ready) return;

    let active = true;

    startLoadingDays(async () => {
      try {
        const response = await availabilityService.getMonthAvailability({
          profissionalId: value.profissional,
          servicoId: value.servico,
          month: monthKey(month),
        });
        if (active) setDays(response);
      } catch {
        if (active) setDays([]);
      }
    });

    return () => {
      active = false;
    };
  }, [month, value.profissional, value.servico, ready, startLoadingDays]);

  useEffect(() => {
    if (!ready || !selectedDate) return;

    let active = true;

    startLoadingSlots(async () => {
      try {
        const response = await availabilityService.getDayAvailability({
          profissionalId: value.profissional,
          servicoId: value.servico,
          date: selectedDate,
        });
        if (active) setSlots(response.slots);
      } catch {
        if (active) setSlots([]);
      }
    });

    return () => {
      active = false;
    };
  }, [selectedDate, value.profissional, value.servico, ready, startLoadingSlots]);

  function selectProfessional(id: string) {
    setSelectedDate("");
    setSlots([]);

    onChange({
      ...value,
      profissional: id,
      data_hora: "",
    });
  }

  function selectService(id: string) {
    setSelectedDate("");
    setSlots([]);

    onChange({
      ...value,
      servico: id,
      data_hora: "",
    });
  }

  function selectDay(date: Date) {
    const selected = dateKey(date);

    setSelectedDate(selected);
    setSlots([]);

    onChange({
      ...value,
      data_hora: "",
    });
  }

  function selectSlot(slot: SlotAvailability) {
    if (disabled || !slot.available) return;

    onChange({
      ...value,
      data_hora: slot.datetime,
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
          Profissional
          <select
            value={value.profissional}
            onChange={(event) => selectProfessional(event.target.value)}
            disabled={disabled}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
          >
            <option value="">Selecione</option>
            {professionals.map((professional) => (
              <option key={professional._id} value={professional._id}>
                {professional.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
          Serviço
          <select
            value={value.servico}
            onChange={(event) => selectService(event.target.value)}
            disabled={disabled}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
          >
            <option value="">Selecione</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} · {service.duracao_min} min
              </option>
            ))}
          </select>
        </label>
      </div>

      {!ready && (
        <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
          Selecione profissional e serviço para consultar a agenda.
        </p>
      )}

      {ready && (
        <>
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMonth((current) => addMonths(current, -1))}
                disabled={disabled || loadingDays}
                aria-label="Mês anterior"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl leading-none text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ←
              </button>

              <div className="text-center">
                <h3 className="text-sm font-semibold capitalize text-slate-900">{monthName}</h3>
                <p className="text-xs text-slate-500" aria-live="polite">
                  {loadingDays ? "Buscando disponibilidade..." : "Selecione uma data"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMonth((current) => addMonths(current, 1))}
                disabled={disabled || loadingDays}
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
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const key = dateKey(date);
                const info = daysMap.get(key);
                const available = info?.available === true;
                const selected = selectedDate === key;
                const today = dateKey(new Date()) === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectDay(date)}
                    disabled={disabled || loadingDays || !available}
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

          {selectedDate && (
            <section className="border-t border-slate-100 pt-3" aria-live="polite">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">Horários disponíveis</h4>
                <span className="text-xs text-slate-500">
                  {loadingSlots
                    ? "Carregando..."
                    : new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                      })}
                </span>
              </div>

              {!loadingSlots && availableSlots.length === 0 && (
                <p className="rounded-lg bg-slate-50 px-3 py-3 text-center text-sm text-slate-500">
                  Nenhum horário disponível nesta data. Escolha outro dia.
                </p>
              )}

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {availableSlots.map((slot) => {
                  const selected = isSameSlot(value.data_hora, slot.datetime);

                  return (
                    <button
                      key={slot.datetime}
                      type="button"
                      onClick={() => selectSlot(slot)}
                      disabled={disabled}
                      className={`h-10 rounded-lg border text-sm font-medium transition ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
