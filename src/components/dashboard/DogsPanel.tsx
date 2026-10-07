import Card from "../ui/Card";
import Icon from "../ui/Icon";
import { dangerButtonClass, secondaryButtonClass, buttonClass } from "./dashboardConfig";
import { resolveImageUrl } from "../../services/uploads/imageUrl";
import type { Pet } from "../../services/types";

interface DogsPanelProps {
  dogs: Pet[];
  isAdmin: boolean;
  saving: boolean;
  onAdd: () => void;
  onEdit: (dog: Pet) => void;
  onDelete: (dog: Pet) => void;
}

export function DogsPanel({ dogs, isAdmin, saving, onAdd, onEdit, onDelete }: DogsPanelProps) {
  return (
    <section>
      <Card
        icon="pets"
        title={isAdmin ? "Cães cadastrados" : "Meus cães"}
        description={isAdmin ? "Gerencie os cães cadastrados." : "Gerencie seus cães."}
      >
        <div className="mb-5 flex justify-end">
          <button className={buttonClass} type="button" onClick={onAdd}>
            Cadastrar Cão
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dogs.map((dog) => (
            <article
              key={dog._id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {dog.foto ? (
                <img
                  src={resolveImageUrl(dog.foto)}
                  alt={dog.nome}
                  className="aspect-[4/3] w-full bg-slate-50 object-contain"
                />
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-blue-50 text-blue-600">
                  <Icon name="pets" />
                </div>
              )}

              <div className="p-4">
                <h3 className="font-black text-slate-950">{dog.nome}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {dog.raca} · {dog.idade} anos
                </p>
                <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  Porte: {dog.porte}
                </span>

                {isAdmin && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Tutor: {dog.cliente?.name ?? "Não informado"}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    className={`${secondaryButtonClass} flex-1`}
                    type="button"
                    onClick={() => onEdit(dog)}
                  >
                    Editar
                  </button>
                  <button
                    className={dangerButtonClass}
                    type="button"
                    onClick={() => onDelete(dog)}
                    disabled={saving}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </article>
          ))}

          {dogs.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
              Nenhum cão cadastrado.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
