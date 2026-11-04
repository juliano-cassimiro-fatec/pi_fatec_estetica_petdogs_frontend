import type { DashboardRepository } from "./types";
import type { AuthUser, Customer, Pet, Professional, Schedule, Service } from "../types";
import type { ProfileFormState } from "./profileForm";
import apiClient from "../api/client";

export const axiosDashboardRepository: DashboardRepository = {
  async getMe() {
    const response = await apiClient.get<{ user: AuthUser }>("/auth/me");
    return response.data.user;
  },

  async listPets() {
    const response = await apiClient.get<Pet[]>("/caes");
    return response.data;
  },

  async listServices() {
    const response = await apiClient.get<Service[]>("/servicos");
    return response.data;
  },

  async listProfessionals() {
    const response = await apiClient.get<Professional[]>("/profissionais");
    return response.data;
  },

  async listCustomers() {
    const response = await apiClient.get<Customer[]>("/clientes");
    return response.data;
  },

  async listSchedules() {
    const response = await apiClient.get<Schedule[]>("/agendamentos");
    return response.data;
  },

  async getCustomerProfile() {
    const response = await apiClient.get<Customer>("/clientes/me");
    return response.data;
  },

  async savePet(payload, id) {
    if (id) {
      await apiClient.put(`/caes/${id}`, payload);
      return;
    }

    await apiClient.post("/caes", payload);
  },

  async saveService(payload, id) {
    if (id) {
      await apiClient.put(`/servicos/${id}`, payload);
      return;
    }

    await apiClient.post("/servicos", payload);
  },

  async saveProfessional(payload, id) {
    if (id) {
      await apiClient.put(`/profissionais/${id}`, payload);
      return;
    }

    await apiClient.post("/profissionais", payload);
  },

  async saveCustomer(payload, id) {
    if (id) {
      await apiClient.put(`/clientes/${id}`, payload);
      return;
    }

    await apiClient.post("/clientes", payload);
  },

  async saveSchedule(payload, id) {
    if (id) {
      await apiClient.put(`/agendamentos/${id}`, payload);
      return;
    }

    await apiClient.post("/agendamentos", payload);
  },

  async confirmSchedule(id) {
    await apiClient.put(`/agendamentos/${id}`, { status: "confirmado" });
  },

  async updateCustomerProfile(payload) {
    await apiClient.put("/clientes/me", payload);
  },

  async updateProfessionalProfile(payload) {
    await apiClient.put("/profissionais/me", payload);
  },

  async remove(path) {
    await apiClient.delete(path);
  },

  async cancelSchedule(id) {
    await apiClient.patch(`/agendamentos/${id}/cancel`);
  },
};

export function createDashboardService(repository: DashboardRepository) {
  return {
    // Métodos de listagem expostos diretamente
    getMe: repository.getMe.bind(repository),
    listPets: repository.listPets.bind(repository),
    listServices: repository.listServices.bind(repository),
    listProfessionals: repository.listProfessionals.bind(repository),
    listCustomers: repository.listCustomers.bind(repository),
    listSchedules: repository.listSchedules.bind(repository),
    getCustomerProfile: repository.getCustomerProfile.bind(repository),

    // Busca o perfil de um profissional específico
    async getProfessionalProfile(userId: string) {
      const professionals = await repository.listProfessionals();
      return professionals.find((item) => item._id === userId);
    },

    // Métodos de mutação
    savePet: repository.savePet.bind(repository),
    saveService: repository.saveService.bind(repository),
    saveProfessional: repository.saveProfessional.bind(repository),
    saveCustomer: repository.saveCustomer.bind(repository),
    saveSchedule: repository.saveSchedule.bind(repository),
    confirmSchedule: repository.confirmSchedule.bind(repository),
    updateProfile(role: AuthUser["role"], payload: ProfileFormState) {
      if (role === "profissional") {
        return repository.updateProfessionalProfile({
          name: payload.name,
          email: payload.email,
          telefone: payload.telefone,
          foto: payload.foto,
          especialidade: payload.especialidade,
          dias_trabalho: payload.dias_trabalho,
          horario_inicio: payload.horario_inicio,
          horario_fim: payload.horario_fim,
          almoco_inicio: payload.almoco_inicio,
          almoco_fim: payload.almoco_fim,
        });
      }
      return repository.updateCustomerProfile({
        name: payload.name,
        email: payload.email,
        telefone: payload.telefone,
        foto: payload.foto,
      });
    },
    removeResource: repository.remove.bind(repository),
    cancelSchedule: repository.cancelSchedule.bind(repository),
  };
}

export const dashboardService = createDashboardService(axiosDashboardRepository);
