import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ToastProvider } from "./ToastProvider";
import { showToast } from "./toastEvents";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("CT-045: exibe e fecha notificação recebida", () => {
  render(
    <ToastProvider>
      <span>Aplicação</span>
    </ToastProvider>,
  );
  act(() => showToast("Erro de teste"));
  expect(screen.getByRole("alert").textContent).toContain("Erro de teste");
  fireEvent.click(screen.getByRole("button", { name: "Fechar aviso" }));
  expect(screen.queryByRole("alert")).toBeNull();
});

it("CT-046: remove notificação após cinco segundos", () => {
  vi.useFakeTimers();
  render(
    <ToastProvider>
      <span>Aplicação</span>
    </ToastProvider>,
  );
  act(() => showToast("Aviso temporário"));
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  expect(screen.queryByRole("alert")).toBeNull();
});
