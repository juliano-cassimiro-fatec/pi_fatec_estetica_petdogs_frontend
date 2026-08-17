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
export type ProfilePayload = Partial<CustomerPayload & ProfessionalPayload>

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
  updateCustomerProfile(payload: ProfilePayload): Promise<void>
  updateProfessionalProfile(payload: ProfilePayload): Promise<void>
  remove(path: string): Promise<void>
  cancelSchedule(id: string): Promise<void>
}
