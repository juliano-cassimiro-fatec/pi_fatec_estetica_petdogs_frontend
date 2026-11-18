import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

afterEach(cleanup);

it("CT-038: não exibe diálogo fechado", () => {
  render(
    <Modal open={false} title="Edição" onClose={vi.fn()}>
      Conteúdo
    </Modal>,
  );
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("CT-039: fecha o diálogo com Escape", () => {
  const onClose = vi.fn();
  render(
    <Modal open title="Edição" description="Edite seus dados" onClose={onClose}>
      Conteúdo
    </Modal>,
  );
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Edição" }), { key: "Escape" });
  expect(onClose).toHaveBeenCalledOnce();
});

it("CT-040: fecha ao clicar fora, mas não no conteúdo", () => {
  const onClose = vi.fn();
  render(
    <Modal open title="Edição" onClose={onClose}>
      <p>Conteúdo</p>
    </Modal>,
  );
  const dialog = screen.getByRole("dialog");
  fireEvent.mouseDown(screen.getByText("Conteúdo"));
  expect(onClose).not.toHaveBeenCalled();
  const overlay = dialog.parentElement;
  expect(overlay).not.toBeNull();
  if (!overlay) throw new Error("Fundo do modal não encontrado");
  fireEvent.mouseDown(overlay);
  expect(onClose).toHaveBeenCalledOnce();
});

it("CT-041: mantém o foco dentro do diálogo ao pressionar Tab", () => {
  render(
    <Modal open title="Edição" onClose={vi.fn()}>
      <button>Salvar</button>
    </Modal>,
  );
  const close = screen.getByRole("button", { name: "Fechar modal" });
  const save = screen.getByRole("button", { name: "Salvar" });
  save.focus();
  fireEvent.keyDown(save, { key: "Tab" });
  expect(document.activeElement).toBe(close);
  fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
  expect(document.activeElement).toBe(save);
});
