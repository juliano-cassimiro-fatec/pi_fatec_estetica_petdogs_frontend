import Card from "../ui/Card";
import Icon from "../ui/Icon";
import {
  buttonClass,
  dangerButtonClass,
  formatCurrency,
  secondaryButtonClass,
} from "./dashboardConfig";
import type { Service } from "../../services/types";

interface ServicesPanelProps {
  services: Service[];
  isAdmin: boolean;
  saving: boolean;
  onAdd: () => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export function ServicesPanel({
  services,
  isAdmin,
  saving,
  onAdd,
  onEdit,
  onDelete,
}: ServicesPanelProps) {
  return (
    <section>
      <Card icon="services" title="Serviços" description="Consulte os serviços disponíveis.">
        {isAdmin && (
          <div className="mb-5 flex justify-end">
            <button className={buttonClass} type="button" onClick={onAdd}>
              Novo serviço
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon name="services" />
              </div>
              <h3 className="mt-4 font-black text-slate-950">{service.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {service.descricao ?? "Sem descrição."}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">{service.duracao_min} min</span>
                <strong className="text-lg font-black text-blue-600">
                  {formatCurrency(service.preco)}
                </strong>
              </div>

              {isAdmin && (
                <div className="mt-4 flex gap-2">
                  <button
                    className={`${secondaryButtonClass} flex-1`}
                    type="button"
                    onClick={() => onEdit(service)}
                  >
                    Editar
                  </button>
                  <button
                    className={dangerButtonClass}
                    type="button"
                    onClick={() => onDelete(service)}
                    disabled={saving}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </article>
          ))}

          {services.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
              Nenhum serviço cadastrado.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
