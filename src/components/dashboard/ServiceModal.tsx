import type { FormEvent } from "react";
import Field from "../ui/Field";
import { Modal } from "../ui/Modal";
import {
  buttonClass,
  inputClass,
  secondaryButtonClass,
  type ServiceFormState,
} from "./dashboardConfig";

interface ServiceModalProps {
  open: boolean;
  editingServiceId: string | null;
  form: ServiceFormState;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (form: ServiceFormState) => void;
}

export function ServiceModal({
  open,
  editingServiceId,
  form,
  saving,
  onClose,
  onSubmit,
  onChange,
}: ServiceModalProps) {
  return (
    <Modal
      open={open}
      title={editingServiceId ? "Editar serviço" : "Novo serviço"}
      description="Informe nome, descrição, duração e preço."
      onClose={onClose}
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Field label="Nome do serviço *">
          <input
            className={inputClass}
            placeholder="Ex.: Banho completo"
            maxLength={45}
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            required
          />
        </Field>

        <Field label="Descrição *">
          <textarea
            className={`${inputClass} min-h-28 resize-none`}
            value={form.descricao}
            onChange={(event) => onChange({ ...form, descricao: event.target.value })}
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Duração (min) *">
            <input
              className={inputClass}
              min="1"
              type="number"
              value={form.duracao_min}
              onChange={(event) => onChange({ ...form, duracao_min: event.target.value })}
              required
            />
          </Field>

          <Field label="Preço *">
            <input
              className={inputClass}
              min="0"
              step="0.01"
              type="number"
              value={form.preco}
              onChange={(event) => onChange({ ...form, preco: event.target.value })}
              required
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button className={secondaryButtonClass} type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className={buttonClass} disabled={saving}>
            {editingServiceId ? "Salvar alterações" : "Cadastrar serviço"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
