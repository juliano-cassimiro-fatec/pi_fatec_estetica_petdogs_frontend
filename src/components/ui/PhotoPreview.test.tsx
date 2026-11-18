import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import PhotoPreview from "./PhotoPreview";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

it("CT-036: apresenta alternativa acessível quando não há foto", () => {
  render(<PhotoPreview alt="Foto do cão" />);
  expect(screen.getByLabelText("Foto do cão").tagName).toBe("DIV");
});

it("CT-037: resolve caminho de upload para a foto", () => {
  vi.stubEnv("VITE_API_URL", "/api/v1");
  render(<PhotoPreview src="/uploads/foto.jpg" alt="Foto do cão" />);
  expect(screen.getByRole("img", { name: "Foto do cão" }).getAttribute("src")).toBe(
    "/uploads/foto.jpg",
  );
});
