import type { ChangeEvent, FormEvent } from "react";
import Field from "../ui/Field";
import { Modal } from "../ui/Modal";
import PasswordInput from "../ui/PasswordInput";
import PhotoPreview from "../ui/PhotoPreview";
import {
  buttonClass,
  formatPhone,
  inputClass,
  secondaryButtonClass,
  weekdayOptions,
  type ProfessionalFormState,
} from "./dashboardConfig";

interface ProfessionalModalProps {
  open: boolean;
  editingProfessionalId: string | null;
  form: ProfessionalFormState;
  uploading: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (form: ProfessionalFormState) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function ProfessionalModal({
  open,
  editingProfessionalId,
  form,
  uploading,
  saving,
  onClose,
  onSubmit,
  onChange,
  onImageChange,
}: ProfessionalModalProps) {
  return (
    <Modal
      open={open}
      title={editingProfessionalId ? "Editar profissional" : "Novo profissional"}
      description="Gerencie os dados e horários do profissional."
      onClose={onClose}
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Field label="Nome *">
          <input
            className={inputClass}
            maxLength={45}
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            required
          />
        </Field>

        <Field label="E-mail *">
          <input
            className={inputClass}
            type="email"
            maxLength={45}
            value={form.email}
            onChange={(event) => onChange({ ...form, email: event.target.value })}
            required
          />
        </Field>

        <Field
          label={editingProfessionalId ? "Nova senha" : "Senha inicial *"}
          hint={
            editingProfessionalId ? "Deixe vazio para manter a senha." : "Mínimo de 6 caracteres."
          }
        >
          <PasswordInput
            className={inputClass}
            minLength={6}
            value={form.senha}
            onChange={(event) => onChange({ ...form, senha: event.target.value })}
            required={!editingProfessionalId}
          />
        </Field>

        <Field label="Telefone">
          <input
            className={inputClass}
            type="tel"
            maxLength={20}
            inputMode="numeric"
            placeholder="(11) 99999-9999"
            value={formatPhone(form.telefone)}
            onChange={(event) => onChange({ ...form, telefone: formatPhone(event.target.value) })}
          />
        </Field>

        <Field label="Especialidade *">
          <input
            className={inputClass}
            value={form.especialidade}
            onChange={(event) => onChange({ ...form, especialidade: event.target.value })}
            required
          />
        </Field>

        <div className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Dias de trabalho *</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {weekdayOptions.map((option) => {
              const selected = form.dias_trabalho.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    onChange({
                      ...form,
                      dias_trabalho: selected
                        ? form.dias_trabalho.filter((item) => item !== option.value)
                        : [...form.dias_trabalho, option.value],
                    })
                  }
                  className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${
                    selected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hora inicial *">
            <input
              className={inputClass}
              type="time"
              value={form.horario_inicio}
              onChange={(event) => onChange({ ...form, horario_inicio: event.target.value })}
              required
            />
          </Field>
          <Field label="Hora final *">
            <input
              className={inputClass}
              type="time"
              value={form.horario_fim}
              onChange={(event) => onChange({ ...form, horario_fim: event.target.value })}
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Saída para almoço">
            <input
              className={inputClass}
              type="time"
              value={form.almoco_inicio}
              onChange={(event) => onChange({ ...form, almoco_inicio: event.target.value })}
            />
          </Field>
          <Field label="Retorno do almoço">
            <input
              className={inputClass}
              type="time"
              value={form.almoco_fim}
              onChange={(event) => onChange({ ...form, almoco_fim: event.target.value })}
            />
          </Field>
        </div>

        <Field label="Foto">
          <input
            className={inputClass}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading || saving}
            onChange={onImageChange}
          />
        </Field>
        <PhotoPreview src={form.foto} alt="Prévia do profissional" />

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button className={secondaryButtonClass} type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className={buttonClass} disabled={saving}>
            {editingProfessionalId ? "Salvar alterações" : "Criar profissional"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
