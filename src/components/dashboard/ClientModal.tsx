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
  type ClientFormState,
} from "./dashboardConfig";

interface ClientModalProps {
  open: boolean;
  editingClientId: string | null;
  form: ClientFormState;
  uploading: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (form: ClientFormState) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function ClientModal({
  open,
  editingClientId,
  form,
  uploading,
  saving,
  onClose,
  onSubmit,
  onChange,
  onImageChange,
}: ClientModalProps) {
  return (
    <Modal
      open={open}
      title={editingClientId ? "Editar cliente" : "Novo cliente"}
      description="Cadastre os dados do tutor."
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
          label={editingClientId ? "Nova senha" : "Senha inicial *"}
          hint={editingClientId ? "Opcional na edição." : "Mínimo de 8 caracteres."}
        >
          <PasswordInput
            className={inputClass}
            minLength={6}
            value={form.senha}
            onChange={(event) => onChange({ ...form, senha: event.target.value })}
            required={!editingClientId}
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

        <Field label="Foto">
          <input
            className={inputClass}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading || saving}
            onChange={onImageChange}
          />
        </Field>
        <PhotoPreview src={form.foto} alt="Prévia do cliente" />

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button className={secondaryButtonClass} type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className={buttonClass} disabled={saving}>
            {editingClientId ? "Salvar alterações" : "Cadastrar cliente"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
