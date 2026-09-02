import { useEffect, useMemo, useState } from "react";
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
  const [month, setMonth] = useState(value.data_hora ? new Date(value.data_hora) : new Date());

  const [selectedDate, setSelectedDate] = useState(value.data_hora?.slice(0, 10) || "");

  const [days, setDays] = useState<DayAvailability[]>([]);
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const selectedService = services.find((service) => service._id === value.servico);

  const selectedProfessional = professionals.find(
    (professional) => professional._id === value.profissional,
  );

  const ready = Boolean(value.profissional && value.servico);

  const daysMap = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);

  const calendarDays = useMemo(() => getDays(month), [month]);

  const monthName = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(month);

  useEffect(() => {
    if (!ready) {
      setDays([]);
      setSlots([]);
      return;
    }

    let active = true;

    setLoadingDays(true);

    availabilityService
      .getMonthAvailability({
        profissionalId: value.profissional,
        servicoId: value.servico,
        month: monthKey(month),
      })
      .then((response) => {
        if (active) setDays(response);
      })
      .catch(() => {
        if (active) setDays([]);
      })
      .finally(() => {
        if (active) setLoadingDays(false);
      });

    return () => {
      active = false;
    };
  }, [month, value.profissional, value.servico, ready]);

  useEffect(() => {
    if (!ready || !selectedDate) {
      setSlots([]);
      return;
    }

    let active = true;

    setLoadingSlots(true);

    availabilityService
      .getDayAvailability({
        profissionalId: value.profissional,
        servicoId: value.servico,
        date: selectedDate,
      })
      .then((response) => {
        if (active) setSlots(response.slots);
      })
      .catch(() => {
        if (active) setSlots([]);
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });

    return () => {
      active = false;
    };
  }, [selectedDate, value.profissional, value.servico, ready]);

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
      data_hora: slot.datetime.slice(0, 16),
    });
  }

  return (
    <div className="space-y-4">
      {/* FILTROS */}
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={value.profissional}
          onChange={(e) => selectProfessional(e.target.value)}
          disabled={disabled}
          className="
            h-11 w-full rounded-xl border border-slate-200
            bg-white px-3 text-sm text-slate-700
            outline-none transition
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100
          "
        >
          <option value="">Profissional</option>

          {professionals.map((professional) => (
            <option key={professional._id} value={professional._id}>
              {professional.name}
            </option>
          ))}
        </select>

        <select
          value={value.servico}
          onChange={(e) => selectService(e.target.value)}
          disabled={disabled}
          className="
            h-11 w-full rounded-xl border border-slate-200
            bg-white px-3 text-sm text-slate-700
            outline-none transition
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100
          "
        >
          <option value="">Serviço</option>

          {services.map((service) => (
            <option key={service._id} value={service._id}>
              {service.name} · {service.duracao_min} min
            </option>
          ))}
        </select>
      </div>

      {!ready && (
        <p className="py-6 text-center text-sm text-slate-400">
          Escolha um profissional e um serviço.
        </p>
      )}

      {ready && (
        <>
          {/* CALENDÁRIO */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMonth((current) => addMonths(current, -1))}
                disabled={disabled || loadingDays}
                className="
                  flex h-8 w-8 items-center justify-center
                  rounded-lg text-slate-500
                  hover:bg-slate-100
                  disabled:opacity-30
                "
              >
                ←
              </button>

              <span className="text-sm font-bold capitalize text-slate-800">{monthName}</span>

              <button
                type="button"
                onClick={() => setMonth((current) => addMonths(current, 1))}
                disabled={disabled || loadingDays}
                className="
                  flex h-8 w-8 items-center justify-center
                  rounded-lg text-slate-500
                  hover:bg-slate-100
                  disabled:opacity-30
                "
              >
                →
              </button>
            </div>

            {/* SEMANA */}
            <div className="mb-2 grid grid-cols-7">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                <span
                  key={`${day}-${index}`}
                  className="
                      text-center text-[11px]
                      font-semibold text-slate-400
                    "
                >
                  {day}
                </span>
              ))}
            </div>

            {/* DIAS */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const key = dateKey(date);
                const info = daysMap.get(key);

                const available = info?.workingDay && info.available;

                const selected = selectedDate === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectDay(date)}
                    disabled={disabled || loadingDays || !available}
                    className={`
                      relative aspect-square
                      rounded-lg text-sm font-semibold
                      transition

                      ${
                        selected
                          ? "bg-blue-600 text-white"
                          : available
                            ? "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                            : "text-slate-300"
                      }
                    `}
                  >
                    {date.getDate()}

                    {available && !selected && (
                      <span
                        className="
                          absolute bottom-1 left-1/2
                          h-1 w-1 -translate-x-1/2
                          rounded-full bg-blue-500
                        "
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* HORÁRIOS */}
          {selectedDate && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Horários</span>

                <span className="text-xs text-slate-400">
                  {loadingSlots ? "Carregando..." : selectedDate}
                </span>
              </div>

              {!loadingSlots && slots.filter((slot) => slot.available).length === 0 && (
                <p className="py-4 text-center text-sm text-slate-400">
                  Nenhum horário disponível.
                </p>
              )}

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots
                  .filter((slot) => slot.available)
                  .map((slot) => {
                    const selected = value.data_hora === slot.datetime.slice(0, 16);

                    return (
                      <button
                        key={slot.datetime}
                        type="button"
                        onClick={() => selectSlot(slot)}
                        disabled={disabled}
                        className={`
                          h-11 rounded-xl border
                          text-sm font-semibold
                          transition

                          ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                          }
                        `}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
