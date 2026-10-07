import type { SlotAvailability } from "../../services/types";
import { isSameSlot } from "./availabilityCalendarUtils";

interface AvailabilityTimeSlotsProps {
  date: string;
  slots: SlotAvailability[];
  selectedValue: string;
  loading: boolean;
  disabled: boolean;
  onSelect: (slot: SlotAvailability) => void;
}

export function AvailabilityTimeSlots({
  date,
  slots,
  selectedValue,
  loading,
  disabled,
  onSelect,
}: AvailabilityTimeSlotsProps) {
  const availableSlots = slots.filter((slot) => slot.available);

  return (
    <section className="border-t border-slate-100 pt-3" aria-live="polite">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900">Horários disponíveis</h4>
        <span className="text-xs text-slate-500">
          {loading
            ? "Carregando..."
            : new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
              })}
        </span>
      </div>

      {!loading && availableSlots.length === 0 && (
        <p className="rounded-lg bg-slate-50 px-3 py-3 text-center text-sm text-slate-500">
          Nenhum horário disponível nesta data. Escolha outro dia.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {availableSlots.map((slot) => {
          const selected = isSameSlot(selectedValue, slot.datetime);

          return (
            <button
              key={slot.datetime}
              type="button"
              onClick={() => onSelect(slot)}
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
  );
}
