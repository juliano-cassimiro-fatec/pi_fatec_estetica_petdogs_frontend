import type { DayAvailability, SlotAvailability } from "../types";

export interface AvailabilityGateway {
  getMonthAvailability(params: {
    profissionalId: string;
    servicoId: string;
    month: string;
  }): Promise<DayAvailability[]>;
  getDayAvailability(params: {
    profissionalId: string;
    servicoId: string;
    date: string;
  }): Promise<{ slots: SlotAvailability[]; available: boolean }>;
}
