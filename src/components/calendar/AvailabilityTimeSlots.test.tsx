import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AvailabilityTimeSlots } from "./AvailabilityTimeSlots";

afterEach(cleanup);

it("CT-042: apresenta e seleciona apenas horários disponíveis", () => {
  const onSelect = vi.fn();
  const available = { time: "09:00", datetime: "2026-09-30T12:00:00Z", available: true };
  const unavailable = { time: "10:00", datetime: "2026-09-30T13:00:00Z", available: false };
  render(
    <AvailabilityTimeSlots
      date="2026-09-30"
      slots={[available, unavailable]}
      selectedValue=""
      loading={false}
      disabled={false}
      onSelect={onSelect}
    />,
  );
  expect(screen.queryByRole("button", { name: "10:00" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "09:00" }));
  expect(onSelect).toHaveBeenCalledWith(available);
});

it("CT-043: informa ausência de horários sem confundir com carregamento", () => {
  const { rerender } = render(
    <AvailabilityTimeSlots
      date="2026-09-30"
      slots={[]}
      selectedValue=""
      loading
      disabled={false}
      onSelect={vi.fn()}
    />,
  );
  expect(screen.getByText("Carregando...")).not.toBeNull();
  expect(screen.queryByText(/Nenhum horário disponível/)).toBeNull();
  rerender(
    <AvailabilityTimeSlots
      date="2026-09-30"
      slots={[]}
      selectedValue=""
      loading={false}
      disabled={false}
      onSelect={vi.fn()}
    />,
  );
  expect(screen.getByText(/Nenhum horário disponível/)).not.toBeNull();
});

it("CT-044: impede seleção quando os controles estão desabilitados", () => {
  const onSelect = vi.fn();
  render(
    <AvailabilityTimeSlots
      date="2026-09-30"
      slots={[{ time: "09:00", datetime: "2026-09-30T12:00:00Z", available: true }]}
      selectedValue="2026-09-30T12:00:00Z"
      loading={false}
      disabled
      onSelect={onSelect}
    />,
  );
  const button = screen.getByRole("button", { name: "09:00" });
  expect(button.hasAttribute("disabled")).toBe(true);
  fireEvent.click(button);
  expect(onSelect).not.toHaveBeenCalled();
});
