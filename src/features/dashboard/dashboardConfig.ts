import type { AuthUser } from "../shared/types";
import type { IconName } from "../../components/ui/Icon";

export type TabKey = "agenda" | "servicos" | "profissionais" | "clientes" | "pets" | "perfil";
export type Role = AuthUser["role"];

export interface ScheduleFormState {
  animal: string;
  servico: string;
  profissional: string;
  data_hora: string;
}

export interface ConfirmModalState {
  title: string;
  description: string;
  confirmLabel: string;
  tone: "danger" | "warning";
  onConfirm: () => Promise<void>;
}

export interface DashboardTab {
  key: TabKey;
  label: string;
  icon: IconName;
  show: boolean;
}

export const inputClass =
  "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";
export const buttonClass =
  "inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60";
export const dangerButtonClass =
  "inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 font-bold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60";

export const weekdayOptions = [
  { label: "Dom", value: 0 },
  { label: "Seg", value: 1 },
  { label: "Ter", value: 2 },
  { label: "Qua", value: 3 },
  { label: "Qui", value: 4 },
  { label: "Sex", value: 5 },
  { label: "Sáb", value: 6 },
];

export const emptyServiceForm = () => ({ name: "", descricao: "", duracao_min: "", preco: "" });
export const emptyClientForm = () => ({ name: "", email: "", senha: "", telefone: "", foto: "" });
export const emptyPetForm = () => ({
  nome: "",
  raca: "",
  idade: "",
  porte: "pequeno",
  foto: "",
  cliente: "",
});
export const emptyProfessionalForm = () => ({
  name: "",
  email: "",
  senha: "",
  telefone: "",
  foto: "",
  especialidade: "",
  dias_trabalho: [1, 2, 3, 4, 5] as number[],
  horario_inicio: "08:00",
  horario_fim: "18:00",
  almoco_inicio: "12:00",
  almoco_fim: "13:00",
});

export function formatCurrency(value: number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function getScheduleStatusPresentation(status: string) {
  const presentations: Record<string, { label: string; badge: string; border: string }> = {
    agendado: {
      label: "Agendado",
      badge: "bg-blue-50 text-blue-700",
      border: "border-slate-200 hover:border-blue-200",
    },
    pendente: {
      label: "Pendente",
      badge: "bg-amber-50 text-amber-700",
      border: "border-amber-200 hover:border-amber-300",
    },
    confirmado: {
      label: "Confirmado",
      badge: "bg-emerald-50 text-emerald-700",
      border: "border-emerald-200 hover:border-emerald-300",
    },
    completo: {
      label: "Concluído",
      badge: "bg-green-50 text-green-700",
      border: "border-green-200 hover:border-green-300",
    },
    cancelado: {
      label: "Cancelado",
      badge: "bg-red-50 text-red-700",
      border: "border-red-200 bg-red-50/30 hover:border-red-300",
    },
  };

  return (
    presentations[status] ?? {
      label: status,
      badge: "bg-slate-100 text-slate-600",
      border: "border-slate-200 hover:border-slate-300",
    }
  );
}

export function validateWorkSchedule(form: {
  dias_trabalho: number[];
  horario_inicio: string;
  horario_fim: string;
  almoco_inicio?: string;
  almoco_fim?: string;
}) {
  if (form.dias_trabalho.length === 0) return "Selecione ao menos um dia de trabalho";
  if (form.horario_inicio >= form.horario_fim)
    return "A hora inicial deve ser anterior à hora final";
  if (form.almoco_inicio && form.almoco_fim) {
    if (form.almoco_inicio >= form.almoco_fim)
      return "O início do almoço deve ser anterior ao retorno";
    if (form.almoco_inicio < form.horario_inicio || form.almoco_fim > form.horario_fim)
      return "O almoço deve estar dentro do expediente";
  }
  return "";
}

export function getDashboardMode(role?: Role) {
  if (role === "cliente")
    return {
      label: "Cliente",
      title: "Área do cliente",
      description: "Agende serviços, acompanhe horários e atualize seus dados.",
    };
  if (role === "profissional")
    return {
      label: "Profissional",
      title: "Painel profissional",
      description: "Organize agenda e acompanhe os atendimentos do dia.",
    };
  return {
    label: "Admin",
    title: "Painel administrativo",
    description: "Gerencie clientes, pets, serviços, profissionais e agenda.",
  };
}
