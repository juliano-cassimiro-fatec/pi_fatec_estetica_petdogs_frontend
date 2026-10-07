import { getScheduleStatusPresentation } from "../dashboard/dashboardConfig";
import type { Schedule } from "../../services/types";
import { formatScheduleTime, getScheduleDog } from "./scheduleUtils";

interface SchedulePrintReportProps {
  rangeLabel: string;
  schedules: Schedule[];
}

export function SchedulePrintReport({ rangeLabel, schedules }: SchedulePrintReportProps) {
  return (
    <section className="schedule-report-print hidden">
      <header className="mb-6 border-b border-slate-300 pb-4">
        <p className="text-sm font-semibold text-slate-600">Estética PetDog&apos;s</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Relatório de agendamentos</h1>
        <p className="mt-1 text-base capitalize text-slate-700">{rangeLabel}</p>
        <p className="mt-1 text-sm text-slate-500">
          {schedules.length} {schedules.length === 1 ? "agendamento" : "agendamentos"}
        </p>
      </header>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            <th>Data</th>
            <th>Horário</th>
            <th>Cão</th>
            <th>Tutor</th>
            <th>Serviço</th>
            <th>Profissional</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule._id}>
              <td>{new Date(schedule.data_hora).toLocaleDateString("pt-BR")}</td>
              <td>{formatScheduleTime(schedule.data_hora)}</td>
              <td>{getScheduleDog(schedule)?.nome ?? "Cão"}</td>
              <td>{schedule.cliente?.name ?? "-"}</td>
              <td>{schedule.servico?.name ?? "-"}</td>
              <td>{schedule.profissional?.name ?? "-"}</td>
              <td>{getScheduleStatusPresentation(schedule.status).label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
