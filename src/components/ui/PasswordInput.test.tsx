import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import PasswordInput from "./PasswordInput";

afterEach(cleanup);

it("CT-034: alterna entre ocultar e mostrar a senha", () => {
  render(<PasswordInput aria-label="Senha" />);
  const input = screen.getByLabelText("Senha");
  expect(input.getAttribute("type")).toBe("password");
  fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
  expect(input.getAttribute("type")).toBe("text");
  fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
  expect(input.getAttribute("type")).toBe("password");
});

it("CT-035: encaminha alterações do campo para o formulário", () => {
  const onChange = vi.fn();
  render(<PasswordInput aria-label="Senha" onChange={onChange} />);
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "minha-senha" } });
  expect(onChange).toHaveBeenCalledOnce();
});
