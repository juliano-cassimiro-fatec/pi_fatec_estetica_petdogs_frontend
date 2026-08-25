import type { DashboardRepository } from "./types"
import type { AuthUser, Customer, Pet, Professional, Schedule, Service } from "../../features/shared/types"
import apiClient, { authenticatedRequestConfig } from "../api/client"

const withAuthentication = authenticatedRequestConfig

export const axiosDashboardRepository: DashboardRepository = {
  async getMe() {
    const response = await apiClient.get<{ user: AuthUser }>("/auth/me", withAuthentication())
    return response.data.user
  },

  async listPets() {
    const response = await apiClient.get<Pet[]>("/pets", withAuthentication())
    return response.data
  },

  async listServices() {
    const response = await apiClient.get<Service[]>("/servicos", withAuthentication())
    return response.data
  },

  async listProfessionals() {
    const response = await apiClient.get<Professional[]>("/profissionais", withAuthentication())
    return response.data
  },

  async listCustomers() {
    const response = await apiClient.get<Customer[]>("/clientes", withAuthentication())
    return response.data
  },

  async listSchedules() {
    const response = await apiClient.get<Schedule[]>("/agendamentos", withAuthentication())
    return response.data
  },

  async getCustomerProfile() {
    const response = await apiClient.get<Customer>("/clientes/me", withAuthentication())
    return response.data
  },

  async savePet(payload, id) {
    if (id) {
      await apiClient.put(`/pets/${id}`, payload, withAuthentication())
      return
    }

    await apiClient.post("/pets", payload, withAuthentication())
  },

  async saveService(payload, id) {
    if (id) {
      await apiClient.put(`/servicos/${id}`, payload, withAuthentication())
      return
    }

    await apiClient.post("/servicos", payload, withAuthentication())
  },

  async saveProfessional(payload, id) {
    if (id) {
      await apiClient.put(`/profissionais/${id}`, payload, withAuthentication())
      return
    }

    await apiClient.post("/profissionais", payload, withAuthentication())
  },

  async saveCustomer(payload, id) {
    if (id) {
      await apiClient.put(`/clientes/${id}`, payload, withAuthentication())
      return
    }

    await apiClient.post("/clientes", payload, withAuthentication())
  },

  async saveSchedule(payload, id) {
    if (id) {
      await apiClient.put(`/agendamentos/${id}`, payload, withAuthentication())
      return
    }

    await apiClient.post("/agendamentos", payload, withAuthentication())
  },

  async updateCustomerProfile(payload) {
    await apiClient.put("/clientes/me", payload, withAuthentication())
  },

  async updateProfessionalProfile(payload) {
    await apiClient.put("/profissionais/me", payload, withAuthentication())
  },

  async remove(path) {
    await apiClient.delete(path, withAuthentication())
  },

  async cancelSchedule(id) {
    await apiClient.patch(`/agendamentos/${id}/cancel`, undefined, withAuthentication())
  },
}

function findProfessionalProfile(user: AuthUser, professionals: Professional[]): Professional | undefined {
  return professionals.find((item) => item._id === user.id)
}

export function createDashboardService(repository: DashboardRepository) {
  return {
    async loadDashboard() {
      const user = await repository.getMe()
      const [services, professionals, schedules] = await Promise.all([
        repository.listServices(), repository.listProfessionals(), repository.listSchedules(),
      ])
      const [pets, customers, customerProfile] = await Promise.all([
        user.role === "cliente" || user.role === "admin" ? repository.listPets() : Promise.resolve([]),
        user.role === "admin" ? repository.listCustomers() : Promise.resolve([]),
        user.role === "cliente" ? repository.getCustomerProfile() : Promise.resolve<Customer | undefined>(undefined),
      ])
      return { user, pets, services, professionals, customers, schedules, profile: user.role === "profissional" ? findProfessionalProfile(user, professionals) : customerProfile }
    },
    savePet: repository.savePet.bind(repository),
    saveService: repository.saveService.bind(repository),
    saveProfessional: repository.saveProfessional.bind(repository),
    saveCustomer: repository.saveCustomer.bind(repository),
    saveSchedule: repository.saveSchedule.bind(repository),
    updateProfile(role: AuthUser["role"], payload: import("../../features/dashboard/profileForm").ProfileFormState) {
      if (role === "profissional") {
        return repository.updateProfessionalProfile({
          name: payload.name, email: payload.email, telefone: payload.telefone, foto: payload.foto,
          especialidade: payload.especialidade, dias_trabalho: payload.dias_trabalho,
          horario_inicio: payload.horario_inicio, horario_fim: payload.horario_fim,
          almoco_inicio: payload.almoco_inicio, almoco_fim: payload.almoco_fim,
        })
      }
      return repository.updateCustomerProfile({ name: payload.name, email: payload.email, telefone: payload.telefone, foto: payload.foto })
    },
    removeResource: repository.remove.bind(repository),
    cancelSchedule: repository.cancelSchedule.bind(repository),
  }
}

export const dashboardService = createDashboardService(axiosDashboardRepository)
