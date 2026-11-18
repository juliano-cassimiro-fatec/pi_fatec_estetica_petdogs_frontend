import { describe, expect, it } from "vitest";
import { can } from "./permissions";

describe("permissões", () => {
  it("CT-023: administrador pode gerenciar serviços", () => {
    expect(can("admin", "service:manage")).toBe(true);
  });

  it("CT-024: cliente não pode gerenciar serviços", () => {
    expect(can("cliente", "service:manage")).toBe(false);
  });

  it("CT-025: profissional pode confirmar agendamento", () => {
    expect(can("profissional", "schedule:confirm")).toBe(true);
  });

  it("CT-026: usuário sem papel não recebe permissão", () => {
    expect(can(undefined, "schedule:create")).toBe(false);
  });
});
