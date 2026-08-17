export type UserRole = "admin" | "profissional" | "cliente"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  foto?: string
  token?: string
  senha?: string
}

export interface AuthSession {
  token: string
  user: AuthUser
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCustomerData {
  name: string
  email: string
  password: string
}

export interface Customer {
  _id: string
  name: string
  email: string
  telefone?: string
  foto?: string
}

export interface Pet {
  _id: string
  nome: string
  raca: string
  idade: number
  porte: string
  foto?: string
  cliente?: Customer
}

export interface Service {
  _id: string
  name: string
  descricao?: string
  duracao_min: number
  preco: number
}

export interface Professional {
  _id: string
  name: string
  email: string
  telefone?: string
  foto?: string
  especialidade: string
  dias_trabalho: number[]
  horario_inicio: string
  horario_fim: string
  almoco_inicio?: string
  almoco_fim?: string
}

export interface Schedule {
  _id: string
  data_hora: string
  status: "scheduled" | "canceled"
  cliente?: Customer
  animal?: Pet
  servico?: Service
  profissional?: Professional
}

export interface DayAvailability {
  date: string
  available: boolean
  slotsCount: number
  workingDay: boolean
}

export interface SlotAvailability {
  time: string
  datetime: string
  available: boolean
}

export interface DashboardData {
  user: AuthUser
  pets: Pet[]
  services: Service[]
  professionals: Professional[]
  customers: Customer[]
  schedules: Schedule[]
  profile?: Customer | Professional
}
