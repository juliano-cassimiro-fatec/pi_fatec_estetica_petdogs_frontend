import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ServicesSection } from "./ServicesSection";

afterEach(cleanup);

it("CT-047: exibe preço e duração de serviço carregado", () => {
  render(
    <ServicesSection
      services={[
        { id: "1", name: "Banho", description: "Cuidado", price: "R$ 50,00", duration: "30 min" },
      ]}
    />,
  );
  expect(screen.getByRole("heading", { name: "Banho" })).not.toBeNull();
  expect(screen.getByText("R$ 50,00")).not.toBeNull();
  expect(screen.getByText("30 min")).not.toBeNull();
});

it("CT-048: solicita consulta de valores quando não há preço ou duração", () => {
  render(<ServicesSection services={[{ id: "1", name: "Tosa", description: "Cuidado" }]} />);
  expect(screen.getByText("Consulte valores")).not.toBeNull();
});

it("CT-049: não exibe serviços enquanto carrega", () => {
  render(
    <ServicesSection loading services={[{ id: "1", name: "Banho", description: "Cuidado" }]} />,
  );
  expect(screen.queryByRole("heading", { name: "Banho" })).toBeNull();
});
