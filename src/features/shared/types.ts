export type UserRole = "admin" | "profissional" | "cliente";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  foto?: string;
  mustChangePassword?: boolean;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCustomerData {
  name: string;
  email: string;
  password: string;
  telefone?: string;
}

export interface RegisterCustomerResponse {
  email: string;
  requiresEmailVerification: boolean;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ResendEmailVerificationData {
  email: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyResetCodeData {
  email: string;
  code: string;
}

export interface ResetPasswordData {
  resetToken: string;
  password: string;
}

export interface ChangePasswordData {
  password: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  telefone?: string;
  foto?: string;
}

export interface Pet {
  _id: string;
  nome: string;
  raca: string;
  idade: number;
  porte: string;
  foto?: string;
  cliente?: Customer;
}

export interface Service {
  _id: string;
  name: string;
  descricao?: string;
  duracao_min: number;
  preco: number;
}

export interface Professional {
  _id: string;
  name: string;
  email: string;
  telefone?: string;
  foto?: string;
  especialidade: string;
  dias_trabalho: number[];
  horario_inicio: string;
  horario_fim: string;
  almoco_inicio?: string;
  almoco_fim?: string;
}

export interface Schedule {
  _id: string;
  data_hora: string;
  status: "agendado" | "cancelado" | "completo" | "pendente" | "confirmado";
  cliente?: Customer;
  animal?: Pet;
  servico?: Service;
  profissional?: Professional;
}

export interface DayAvailability {
  date: string;
  available: boolean;
  slotsCount: number;
  workingDay: boolean;
}

export interface SlotAvailability {
  time: string;
  datetime: string;
  available: boolean;
}
