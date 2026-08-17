import type { AuthUser, Customer, Pet, Professional, Schedule, Service } from "../../features/shared/types"

export type PetPayload = Omit<Pet, "_id" | "cliente"> & { cliente?: string }
export type ServicePayload = Omit<Service, "_id">
export type ProfessionalPayload = Omit<Professional, "_id"> & { senha?: string }
export type CustomerPayload = Omit<Customer, "_id"> & { senha?: string }
export type SchedulePayload = {
  animal: string
  servico: string
  profissional: string
  data_hora: string
}
export type CustomerProfilePayload = Pick<Customer, "name" | "email" | "telefone" | "foto">
export type ProfessionalProfilePayload = Pick<Professional, "name" | "email" | "telefone" | "foto" | "especialidade" | "dias_trabalho" | "horario_inicio" | "horario_fim" | "almoco_inicio" | "almoco_fim">

export interface DashboardRepository {
  getMe(): Promise<AuthUser>
  listPets(): Promise<Pet[]>
  listServices(): Promise<Service[]>
  listProfessionals(): Promise<Professional[]>
  listCustomers(): Promise<Customer[]>
  listSchedules(): Promise<Schedule[]>
  getCustomerProfile(): Promise<Customer>
  savePet(payload: PetPayload, id?: string | null): Promise<void>
  saveService(payload: ServicePayload, id?: string | null): Promise<void>
  saveProfessional(payload: ProfessionalPayload, id?: string | null): Promise<void>
  saveCustomer(payload: CustomerPayload, id?: string | null): Promise<void>
  saveSchedule(payload: SchedulePayload, id?: string | null): Promise<void>
  updateCustomerProfile(payload: CustomerProfilePayload): Promise<void>
  updateProfessionalProfile(payload: ProfessionalProfilePayload): Promise<void>
  remove(path: string): Promise<void>
  cancelSchedule(id: string): Promise<void>
}
