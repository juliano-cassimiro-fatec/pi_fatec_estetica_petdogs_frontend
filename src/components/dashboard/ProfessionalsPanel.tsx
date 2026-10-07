import Card from "../ui/Card";
import Icon from "../ui/Icon";
import { resolveImageUrl } from "../../services/uploads/imageUrl";
import { buttonClass, dangerButtonClass, secondaryButtonClass } from "./dashboardConfig";
import type { Professional } from "../../services/types";

interface ProfessionalsPanelProps {
  professionals: Professional[];
  isAdmin: boolean;
  saving: boolean;
  onAdd: () => void;
  onEdit: (professional: Professional) => void;
  onDelete: (professional: Professional) => void;
}

export function ProfessionalsPanel({
  professionals,
  isAdmin,
  saving,
  onAdd,
  onEdit,
  onDelete,
}: ProfessionalsPanelProps) {
  return (
    <section>
      <Card icon="users" title="Profissionais" description="Conheça os profissionais disponíveis.">
        {isAdmin && (
          <div className="mb-5 flex justify-end">
            <button className={buttonClass} type="button" onClick={onAdd}>
              Novo profissional
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((professional) => (
            <article
              key={professional._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                {professional.foto ? (
                  <img
                    src={resolveImageUrl(professional.foto)}
                    alt={professional.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon name="user" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-black text-slate-950">{professional.name}</h3>
                  <p className="text-sm text-slate-500">{professional.especialidade}</p>
                </div>
              </div>

              <p className="mt-4 truncate text-xs font-semibold text-slate-400">
                {professional.email}
              </p>

              {isAdmin && (
                <div className="mt-4 flex gap-2">
                  <button
                    className={`${secondaryButtonClass} flex-1`}
                    type="button"
                    onClick={() => onEdit(professional)}
                  >
                    Editar
                  </button>
                  <button
                    className={dangerButtonClass}
                    type="button"
                    onClick={() => onDelete(professional)}
                    disabled={saving}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </article>
          ))}

          {professionals.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
              Nenhum profissional cadastrado.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
