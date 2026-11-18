import { beforeEach, describe, expect, it } from "vitest";
import { browserSessionStorage } from "./browserSession";
import type { AuthSession } from "../types";

const session: AuthSession = {
  token: "session-token",
  user: { id: "1", name: "Pessoa", email: "pessoa@example.com", role: "cliente" },
};

beforeEach(() => localStorage.clear());

describe("browserSessionStorage", () => {
  it("CT-001: salva e recupera a sessão", () => {
    browserSessionStorage.saveSession(session);
    expect(browserSessionStorage.getToken()).toBe(session.token);
    expect(browserSessionStorage.getSession()).toEqual(session);
  });

  it("CT-002: aceita o token legado e prioriza o token atual", () => {
    localStorage.setItem("token", "legacy");
    localStorage.setItem("user", JSON.stringify(session.user));
    expect(browserSessionStorage.getSession()).toEqual({ ...session, token: "legacy" });
    browserSessionStorage.saveSession(session);
    expect(browserSessionStorage.getToken()).toBe(session.token);
  });

  it("CT-003: não devolve sessão incompleta", () => {
    localStorage.setItem("petshop-token", "token");
    expect(browserSessionStorage.getSession()).toBeNull();
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify(session.user));
    expect(browserSessionStorage.getSession()).toBeNull();
  });

  it.each([
    ["CT-004: JSON inválido", "{"],
    ["CT-005: identificador ausente", JSON.stringify({ ...session.user, id: "" })],
    ["CT-006: nome ausente", JSON.stringify({ ...session.user, name: "" })],
    ["CT-007: email ausente", JSON.stringify({ ...session.user, email: "" })],
    ["CT-008: papel inválido", JSON.stringify({ ...session.user, role: "desconhecido" })],
    ["CT-009: valor nulo", "null"],
  ])("%s", (_description, user) => {
    localStorage.setItem("petshop-token", "token");
    localStorage.setItem("token", "legacy");
    localStorage.setItem("user", user);
    expect(browserSessionStorage.getSession()).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it("CT-010: remove dados atuais e legados sem afetar outras chaves", () => {
    browserSessionStorage.saveSession(session);
    localStorage.setItem("token", "legacy");
    localStorage.setItem("other", "value");
    browserSessionStorage.clearSession();
    expect(localStorage.length).toBe(1);
    expect(localStorage.getItem("other")).toBe("value");
  });
});
