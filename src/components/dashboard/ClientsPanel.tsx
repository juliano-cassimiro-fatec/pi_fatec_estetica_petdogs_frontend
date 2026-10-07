import Card from "../ui/Card";
import Icon from "../ui/Icon";
import { resolveImageUrl } from "../../services/uploads/imageUrl";
import { buttonClass, dangerButtonClass, secondaryButtonClass } from "./dashboardConfig";
import type { Customer } from "../../services/types";

interface ClientsPanelProps {
  customers: Customer[];
  saving: boolean;
  onAdd: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function ClientsPanel({ customers, saving, onAdd, onEdit, onDelete }: ClientsPanelProps) {
  return (
    <section>
      <Card icon="clients" title="Clientes" description="Gerencie os tutores cadastrados.">
        <div className="mb-5 flex justify-end">
          <button className={buttonClass} type="button" onClick={onAdd}>
            Novo cliente
          </button>
        </div>

        <div className="grid gap-3">
          {customers.map((customer) => (
            <article
              key={customer._id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                {customer.foto ? (
                  <img
                    src={resolveImageUrl(customer.foto)}
                    alt={customer.name}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon name="clients" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-black text-slate-950">{customer.name}</h3>
                  <p className="truncate text-sm text-slate-500">{customer.email}</p>
                  <p className="text-xs text-slate-400">{customer.telefone ?? "Sem telefone"}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className={secondaryButtonClass}
                  type="button"
                  onClick={() => onEdit(customer)}
                >
                  Editar
                </button>
                <button
                  className={dangerButtonClass}
                  type="button"
                  onClick={() => onDelete(customer)}
                  disabled={saving}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}

          {customers.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
              Nenhum cliente cadastrado.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
