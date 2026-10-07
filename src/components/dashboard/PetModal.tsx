import type { ChangeEvent, FormEvent } from "react";
import Field from "../ui/Field";
import { Modal } from "../ui/Modal";
import PhotoPreview from "../ui/PhotoPreview";
import {
  buttonClass,
  inputClass,
  type PetFormState,
  secondaryButtonClass,
} from "./dashboardConfig";
import type { Customer } from "../../services/types";

const dogBreeds = [
  "Akita",
  "Beagle",
  "Border Collie",
  "Boxer",
  "Bulldog Francês",
  "Chihuahua",
  "Chow Chow",
  "Cocker Spaniel",
  "Dachshund (Salsicha)",
  "Golden Retriever",
  "Husky Siberiano",
  "Labrador Retriever",
  "Lhasa Apso",
  "Maltês",
  "Pastor Alemão",
  "Pinscher",
  "Pit Bull",
  "Poodle",
  "Pug",
  "Rottweiler",
  "Schnauzer",
  "Shih Tzu",
  "Spitz Alemão",
  "Yorkshire Terrier",
  "SRD (Sem Raça Definida)",
];

function getTodayDateInputValue() {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

interface PetModalProps {
  open: boolean;
  isAdmin: boolean;
  editingPetId: string | null;
  form: PetFormState;
  customers: Customer[];
  uploading: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (form: PetFormState) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function PetModal({
  open,
  isAdmin,
  editingPetId,
  form,
  customers,
  uploading,
  saving,
  onClose,
  onSubmit,
  onChange,
  onImageChange,
}: PetModalProps) {
  return (
    <Modal
      open={open}
      title={editingPetId ? "Editar cão" : "Cadastrar cão"}
      description={isAdmin ? "Cadastre o cão e vincule ao tutor." : "Cadastre seu cão."}
      onClose={onClose}
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        {isAdmin && (
          <Field label="Tutor *">
            <select
              className={inputClass}
              value={form.cliente}
              onChange={(event) => onChange({ ...form, cliente: event.target.value })}
              required
            >
              <option value="">Selecione o cliente</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Nome do cão *">
          <input
            className={inputClass}
            placeholder="Ex.: Luna"
            maxLength={45}
            value={form.nome}
            onChange={(event) => onChange({ ...form, nome: event.target.value })}
            required
          />
        </Field>

        <Field label="Raça *">
          <select
            className={inputClass}
            value={form.raca}
            onChange={(event) => onChange({ ...form, raca: event.target.value })}
            required
          >
            {!dogBreeds.includes(form.raca) && form.raca && (
              <option value={form.raca}>{form.raca}</option>
            )}
            <option value="">Selecione a raça</option>
            {dogBreeds.map((breed) => (
              <option key={breed} value={breed}>
                {breed}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Data de nascimento *"
            labelClassName="grid gap-1.5 text-xs font-semibold text-slate-600"
            hint={
              editingPetId
                ? "A data não é armazenada no cadastro atual. Informe-a novamente ao editar."
                : "O cão deve ter até 18 anos."
            }
          >
            <input
              className={inputClass}
              max={getTodayDateInputValue()}
              type="date"
              value={form.dataNascimento}
              onChange={(event) => onChange({ ...form, dataNascimento: event.target.value })}
              required
            />
          </Field>

          <Field label="Porte *">
            <select
              className={inputClass}
              value={form.porte}
              onChange={(event) => onChange({ ...form, porte: event.target.value })}
              required
            >
              <option value="pequeno">Pequeno</option>
              <option value="medio">Médio</option>
              <option value="grande">Grande</option>
            </select>
          </Field>
        </div>

        <Field label="Foto do cão">
          <input
            className={inputClass}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading || saving}
            onChange={onImageChange}
          />
          <PhotoPreview src={form.foto} alt="Foto do cão" />
        </Field>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button className={secondaryButtonClass} type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className={buttonClass} disabled={saving}>
            {editingPetId ? "Salvar alterações" : "Cadastrar cão"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
