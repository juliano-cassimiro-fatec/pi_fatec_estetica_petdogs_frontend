import type { FormEvent } from "react";
import { AvailabilityCalendar } from "../calendar/AvailabilityCalendar";
import { Modal } from "../ui/Modal";
import Field from "../ui/Field";
import {
  buttonClass,
  inputClass,
  secondaryButtonClass,
  type ScheduleFormState,
} from "./dashboardConfig";
import type { Pet, Professional, Service } from "../../services/types";

interface ScheduleModalProps {
  open: boolean;
  editingScheduleId: string | null;
  form: ScheduleFormState;
  dogs: Pet[];
  professionals: Professional[];
  services: Service[];
  initialDate: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (form: ScheduleFormState) => void;
}

export function ScheduleModal({
  open,
  editingScheduleId,
  form,
  dogs,
  professionals,
  services,
  initialDate,
  saving,
  onClose,
  onSubmit,
  onChange,
}: ScheduleModalProps) {
  return (
    <Modal
      open={open}
      title={editingScheduleId ? "Editar agendamento" : "Novo agendamento"}
      description="Escolha o cão, serviço, profissional e horário."
      size="compact"
      onClose={onClose}
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Field label="Cão *">
          <select
            className={inputClass}
            value={form.cao}
            onChange={(event) => onChange({ ...form, cao: event.target.value })}
            required
          >
            <option value="">Selecione o cão</option>
            {dogs.map((dog) => (
              <option key={dog._id} value={dog._id}>
                {dog.nome}
              </option>
            ))}
          </select>
        </Field>

        <AvailabilityCalendar
          professionals={professionals}
          services={services}
          initialDate={initialDate}
          value={{
            profissional: form.profissional,
            servico: form.servico,
            data_hora: form.data_hora,
          }}
          onChange={(next) => onChange({ ...form, ...next })}
          disabled={saving}
        />

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            className={secondaryButtonClass}
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Fechar
          </button>
          <button className={buttonClass} disabled={saving || !form.data_hora || !form.cao}>
            {editingScheduleId ? "Salvar agendamento" : "Confirmar agendamento"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
