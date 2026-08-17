import type { ChangeEvent } from "react"
import type { AuthUser } from "../shared/types"
import type { IconName } from "../../components/ui/Icon"

export type TabKey = "agenda" | "servicos" | "profissionais" | "clientes" | "pets" | "perfil"
export type Role = AuthUser["role"]

export interface ScheduleFormState {
  animal: string
  servico: string
  profissional: string
  data_hora: string
}

export interface ConfirmModalState {
  title: string
  description: string
  confirmLabel: string
  tone: "danger" | "warning"
  onConfirm: () => Promise<void>
}

export interface DashboardTab {
  key: TabKey
  label: string
  icon: IconName
  show: boolean
}

export const inputClass = "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
export const buttonClass = "inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
export const secondaryButtonClass = "inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
export const dangerButtonClass = "inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 font-bold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"

export const weekdayOptions = [
  { label: "Dom", value: 0 }, { label: "Seg", value: 1 }, { label: "Ter", value: 2 },
  { label: "Qua", value: 3 }, { label: "Qui", value: 4 }, { label: "Sex", value: 5 },
  { label: "Sáb", value: 6 },
]

export const emptyServiceForm = () => ({ name: "", descricao: "", duracao_min: "", preco: "" })
export const emptyClientForm = () => ({ name: "", email: "", senha: "", telefone: "", foto: "" })
export const emptyPetForm = () => ({ nome: "", raca: "", idade: "", porte: "pequeno", foto: "", cliente: "" })
export const emptyProfessionalForm = () => ({
  name: "", email: "", senha: "", telefone: "", foto: "", especialidade: "",
  dias_trabalho: [1, 2, 3, 4, 5] as number[], horario_inicio: "08:00", horario_fim: "18:00",
  almoco_inicio: "12:00", almoco_fim: "13:00",
})

export function formatCurrency(value: number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function validateWorkSchedule(form: { dias_trabalho: number[]; horario_inicio: string; horario_fim: string; almoco_inicio?: string; almoco_fim?: string }) {
  if (form.dias_trabalho.length === 0) return "Selecione ao menos um dia de trabalho"
  if (form.horario_inicio >= form.horario_fim) return "A hora inicial deve ser anterior à hora final"
  if (form.almoco_inicio && form.almoco_fim) {
    if (form.almoco_inicio >= form.almoco_fim) return "O início do almoço deve ser anterior ao retorno"
    if (form.almoco_inicio < form.horario_inicio || form.almoco_fim > form.horario_fim) return "O almoço deve estar dentro do expediente"
  }
  return ""
}

export function getDashboardMode(role?: Role) {
  if (role === "cliente") return { label: "Cliente", title: "Área do cliente", description: "Agende serviços, acompanhe horários e atualize seus dados." }
  if (role === "profissional") return { label: "Profissional", title: "Painel profissional", description: "Organize agenda e acompanhe os atendimentos do dia." }
  return { label: "Admin", title: "Painel administrativo", description: "Gerencie clientes, pets, serviços, profissionais e agenda." }
}

async function compressImage(file: File): Promise<string> {
  const image = new Image()
  const source = URL.createObjectURL(file)
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error("Imagem inválida"))
      image.src = source
    })
    const maxSize = 900
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(image.width * scale)
    canvas.height = Math.round(image.height * scale)
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Não foi possível processar a imagem")
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/jpeg", 0.72)
  } finally {
    URL.revokeObjectURL(source)
  }
}

export async function readImage(event: ChangeEvent<HTMLInputElement>, callback: (value: string) => void, onError: (value: string) => void) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith("image/")) return onError("Selecione um arquivo de imagem válido")
  if (file.size > 8 * 1024 * 1024) return onError("A imagem deve ter no máximo 8 MB")
  try {
    callback(await compressImage(file))
  } catch {
    onError("Não foi possível carregar a imagem")
  }
}
