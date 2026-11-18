import { describe, expect, it } from "vitest";
import {
  addMonths,
  dateKey,
  getCalendarDays,
  isSameSlot,
  localDateKeyFromValue,
  parseCalendarDate,
} from "./availabilityCalendarUtils";

describe("calendário de disponibilidade", () => {
  it("CT-027: preserva a data local sem deslocamento UTC", () => {
    expect(dateKey(parseCalendarDate("2026-09-30"))).toBe("2026-09-30");
  });

  it("CT-028: não retorna chave para data inválida", () => {
    expect(localDateKeyFromValue("inválida")).toBe("");
  });

  it("CT-029: reconhece horários equivalentes com fusos diferentes", () => {
    expect(isSameSlot("2026-09-30T12:00:00Z", "2026-09-30T09:00:00-03:00")).toBe(true);
  });

  it("CT-030: não seleciona um horário vazio", () => {
    expect(isSameSlot("", "2026-09-30T12:00:00Z")).toBe(false);
  });

  it("CT-031: avança meses sem extrapolar dias", () => {
    expect(dateKey(addMonths(new Date(2026, 0, 31), 1))).toBe("2026-02-01");
  });

  it("CT-032: inclui os espaços e dias do mês no calendário", () => {
    const days = getCalendarDays(new Date(2026, 1, 1));
    expect(days).toHaveLength(28);
    expect(days[0] && dateKey(days[0])).toBe("2026-02-01");
    expect(days[27] && dateKey(days[27])).toBe("2026-02-28");
  });
});
