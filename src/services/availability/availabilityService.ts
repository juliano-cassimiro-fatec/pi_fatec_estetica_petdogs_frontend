import type { AvailabilityGateway } from "./types"
import type { DayAvailability, SlotAvailability } from "../../features/shared/types"
import apiClient, { authenticatedRequestConfig } from "../api/client"

export const axiosAvailabilityGateway: AvailabilityGateway = {
  async getMonthAvailability(params) {
    const response = await apiClient.get<{ month: string; days: DayAvailability[] }>("/agendamentos/disponibilidade/mes", authenticatedRequestConfig({ params }))
    return response.data.days
  },

  async getDayAvailability(params) {
    const response = await apiClient.get<{ slots: SlotAvailability[]; available: boolean }>("/agendamentos/disponibilidade", authenticatedRequestConfig({ params }))
    return response.data
  },
}

export function createAvailabilityService(gateway: AvailabilityGateway) {
  return {
    getMonthAvailability: gateway.getMonthAvailability.bind(gateway),
    getDayAvailability: gateway.getDayAvailability.bind(gateway),
  }
}

export const availabilityService = createAvailabilityService(axiosAvailabilityGateway)
