import Icon from "../ui/Icon";
import { getScheduleStatusPresentation } from "../dashboard/dashboardConfig";
import type { Schedule } from "../../services/types";
import { resolveImageUrl } from "../../services/uploads/imageUrl";
import { buttonClass, dangerButtonClass, secondaryButtonClass } from "../dashboard/dashboardConfig";
import { formatScheduleTime, getScheduleDog } from "./scheduleUtils";

interface ScheduleDayListProps {
  schedules: Schedule[];
  isAdmin: boolean;
  canEdit: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  disabled: boolean;
  onEdit: (schedule: Schedule) => void;
  onConfirm: (schedule: Schedule) => void;
  onCancel: (schedule: Schedule) => void;
}

export function ScheduleDayList({
  schedules,
  isAdmin,
  canEdit,
  canConfirm,
  canCancel,
  disabled,
  onEdit,
  onConfirm,
  onCancel,
}: ScheduleDayListProps) {
  if (schedules.length === 0) {
    return (
      <div className="rounded-lg bg-slate-50 px-4 py-8 text-center">
        <p className="text-sm font-medium text-slate-700">Nenhum agendamento neste dia</p>
        <p className="mt-1 text-xs text-slate-500">Selecione outra data ou crie um novo horário.</p>
      </div>
    );
  }

  return (
    <div className="max-h-[25rem] space-y-2 overflow-y-auto pr-1">
      {schedules.map((schedule) => {
        const status = getScheduleStatusPresentation(schedule.status);
        const dog = getScheduleDog(schedule);

        return (
          <article className={`rounded-lg border bg-white p-3 ${status.border}`} key={schedule._id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                {dog?.foto ? (
                  <img
                    src={resolveImageUrl(dog.foto)}
                    alt=""
                    aria-hidden="true"
                    className="h-9 w-9 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon name="pets" className="h-4 w-4" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatScheduleTime(schedule.data_hora)} · {dog?.nome ?? "Cão"}
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-600">
                    {schedule.servico?.name ?? "Serviço"} ·{" "}
                    {schedule.profissional?.name ?? "Profissional"}
                  </p>
                  {isAdmin && schedule.cliente && (
                    <p className="mt-1 text-xs text-slate-500">Cliente: {schedule.cliente.name}</p>
                  )}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${status.badge}`}
              >
                {status.label}
              </span>
            </div>

            {(canEdit || canConfirm || canCancel) &&
              (schedule.status === "agendado" || schedule.status === "confirmado") && (
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  {canEdit && (
                    <button
                      className={secondaryButtonClass}
                      disabled={disabled}
                      onClick={() => onEdit(schedule)}
                      type="button"
                    >
                      Editar
                    </button>
                  )}
                  {canConfirm && schedule.status === "agendado" && (
                    <button
                      className={buttonClass}
                      disabled={disabled}
                      onClick={() => onConfirm(schedule)}
                      type="button"
                    >
                      Confirmar
                    </button>
                  )}
                  {canCancel && (
                    <button
                      className={dangerButtonClass}
                      disabled={disabled}
                      onClick={() => onCancel(schedule)}
                      type="button"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              )}
          </article>
        );
      })}
    </div>
  );
}
