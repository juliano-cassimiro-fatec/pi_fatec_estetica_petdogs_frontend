import { ScheduleCalendar } from "../calendar/ScheduleCalendar";
import Card from "../ui/Card";
import type { Schedule } from "../../services/types";

interface SchedulePanelProps {
  schedules: Schedule[];
  isAdmin: boolean;
  isProfessional: boolean;
  canEdit: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  canCreate: boolean;
  saving: boolean;
  onCreate: (date: string) => void;
  onEdit: (schedule: Schedule) => void;
  onConfirm: (schedule: Schedule) => void;
  onCancel: (schedule: Schedule) => void;
}

export function SchedulePanel({
  schedules,
  isAdmin,
  isProfessional,
  canEdit,
  canConfirm,
  canCancel,
  canCreate,
  saving,
  onCreate,
  onEdit,
  onConfirm,
  onCancel,
}: SchedulePanelProps) {
  return (
    <section className="space-y-6">
      <Card
        icon="calendar"
        title="Agendamentos"
        description={
          isAdmin
            ? "Visualize todos os agendamentos."
            : isProfessional
              ? "Visualize seus atendimentos."
              : "Visualize seus horários."
        }
      >
        <ScheduleCalendar
          schedules={schedules}
          isAdmin={isAdmin}
          canEdit={canEdit}
          canConfirm={canConfirm}
          canCancel={canCancel}
          canCreate={canCreate}
          disabled={saving}
          onCreate={onCreate}
          onEdit={onEdit}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </Card>
    </section>
  );
}
