import { useEffect, useMemo, useState, useTransition } from "react";
import { availabilityService } from "../../services/availability/availabilityService";
import type {
  DayAvailability,
  Professional,
  Service,
  SlotAvailability,
} from "../../services/types";
import { AvailabilityDatePicker } from "./AvailabilityDatePicker";
import { AvailabilityTimeSlots } from "./AvailabilityTimeSlots";
import {
  dateKey,
  localDateKeyFromValue,
  monthKey,
  parseCalendarDate,
} from "./availabilityCalendarUtils";

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
  initialDate?: string;
  disabled?: boolean;
}

export function AvailabilityCalendar({
  professionals,
  services,
  value,
  onChange,
  initialDate,
  disabled = false,
}: CalendarProps) {
  const [month, setMonth] = useState(() =>
    initialDate
      ? parseCalendarDate(initialDate)
      : value.data_hora
        ? parseCalendarDate(value.data_hora)
        : new Date(),
  );

  const [selectedDate, setSelectedDate] = useState(
    () => initialDate ?? localDateKeyFromValue(value.data_hora),
  );

  const [days, setDays] = useState<DayAvailability[]>([]);
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [loadingDays, startLoadingDays] = useTransition();
  const [loadingSlots, startLoadingSlots] = useTransition();

  const ready = Boolean(value.profissional && value.servico);

  const daysMap = useMemo(
    () => new Map((ready ? days : []).map((day) => [day.date, day])),
    [days, ready],
  );
  useEffect(() => {
    if (!ready || initialDate) return;

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
  }, [initialDate, month, value.profissional, value.servico, ready, startLoadingDays]);

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
    if (!initialDate) setSelectedDate("");
    setSlots([]);

    onChange({
      ...value,
      profissional: id,
      data_hora: "",
    });
  }

  function selectService(id: string) {
    if (!initialDate) setSelectedDate("");
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

      {initialDate && selectedDate && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Data selecionada:{" "}
          <strong className="font-semibold text-slate-900">
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </strong>
        </p>
      )}

      {!ready && (
        <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
          Selecione profissional e serviço para consultar a agenda.
        </p>
      )}

      {ready && (
        <>
          {!initialDate && (
            <AvailabilityDatePicker
              month={month}
              daysMap={daysMap}
              selectedDate={selectedDate}
              loading={loadingDays}
              disabled={disabled}
              onMonthChange={setMonth}
              onSelectDay={selectDay}
            />
          )}

          {selectedDate && (
            <AvailabilityTimeSlots
              date={selectedDate}
              slots={slots}
              selectedValue={value.data_hora}
              loading={loadingSlots}
              disabled={disabled}
              onSelect={selectSlot}
            />
          )}
        </>
      )}
    </div>
  );
}
