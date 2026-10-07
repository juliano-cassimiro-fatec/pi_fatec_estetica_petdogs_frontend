import type { ChangeEvent, FormEvent } from "react";
import Card from "../ui/Card";
import Field from "../ui/Field";
import PhotoPreview from "../ui/PhotoPreview";
import { buttonClass, formatPhone, inputClass } from "./dashboardConfig";
import type { ProfileFormState } from "../../services/dashboard/profileForm";

interface ProfilePanelProps {
  form: ProfileFormState;
  uploading: boolean;
  saving: boolean;
  onChange: (form: ProfileFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function ProfilePanel({
  form,
  uploading,
  saving,
  onChange,
  onSubmit,
  onImageChange,
}: ProfilePanelProps) {
  return (
    <section>
      <Card icon="settings" title="Meu perfil" description="Atualize seus dados pessoais.">
        <form className="grid gap-5" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
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
            <Field label="Telefone">
              <input
                className={inputClass}
                type="tel"
                maxLength={25}
                inputMode="numeric"
                placeholder="(11) 99999-9999"
                value={formatPhone(form.telefone)}
                onChange={(event) =>
                  onChange({ ...form, telefone: formatPhone(event.target.value) })
                }
              />
            </Field>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
            <PhotoPreview
              src={form.foto}
              alt="Foto do perfil"
              className="h-28 w-28 shrink-0 rounded-2xl sm:h-32 sm:w-32"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900">Foto do perfil</p>
              <p className="mt-1 text-sm text-slate-500">
                Escolha uma imagem para identificar seu perfil.
              </p>
              <input
                className={`${inputClass} mt-3 w-full text-sm sm:max-w-md`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploading || saving}
                onChange={onImageChange}
              />
            </div>
          </div>

          <div>
            <button className={buttonClass} disabled={saving}>
              Salvar alterações
            </button>
          </div>
        </form>
      </Card>
    </section>
  );
}
