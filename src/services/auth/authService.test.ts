import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthUseCases } from "./authService";
import type { AuthRepository } from "./types";
import type { SessionStorage } from "../session/browserSession";
import type { AuthSession } from "../types";

const session: AuthSession = {
  token: "token-de-teste",
  user: { id: "1", name: "Cliente", email: "cliente@example.test", role: "cliente" },
};

function setup() {
  const repository = {
    login: vi.fn<AuthRepository["login"]>().mockResolvedValue(session),
    me: vi.fn<AuthRepository["me"]>().mockResolvedValue(session.user),
    changePassword: vi.fn<AuthRepository["changePassword"]>().mockResolvedValue(session),
    verifyEmail: vi.fn<AuthRepository["verifyEmail"]>().mockResolvedValue(session),
    registerCustomer: vi.fn<AuthRepository["registerCustomer"]>(),
    resendEmailVerification: vi.fn<AuthRepository["resendEmailVerification"]>(),
    forgotPassword: vi.fn<AuthRepository["forgotPassword"]>(),
    verifyResetCode: vi.fn<AuthRepository["verifyResetCode"]>(),
    resetPassword: vi.fn<AuthRepository["resetPassword"]>(),
  } satisfies AuthRepository;
  const storage = {
    getSession: vi.fn<SessionStorage["getSession"]>(),
    getToken: vi.fn<SessionStorage["getToken"]>().mockReturnValue(null),
    saveSession: vi.fn<SessionStorage["saveSession"]>(),
    clearSession: vi.fn<SessionStorage["clearSession"]>(),
  } satisfies SessionStorage;
  return { repository, storage, auth: createAuthUseCases(repository, storage) };
}

beforeEach(() => vi.restoreAllMocks());

describe("casos de uso de autenticação", () => {
  it("CT-050: guarda sessão após autenticação", async () => {
    const { auth, repository, storage } = setup();
    const credentials = { email: "cliente@example.test", password: "senha" };
    expect(await auth.signIn(credentials)).toEqual(session);
    expect(repository.login).toHaveBeenCalledWith(credentials);
    expect(storage.saveSession).toHaveBeenCalledWith(session);
  });

  it("CT-051: não persiste sessão se o login falhar", async () => {
    const { auth, repository, storage } = setup();
    repository.login.mockRejectedValue(new Error("Credenciais inválidas"));
    await expect(
      auth.signIn({ email: "cliente@example.test", password: "errada" }),
    ).rejects.toThrow("Credenciais inválidas");
    expect(storage.saveSession).not.toHaveBeenCalled();
  });

  it("CT-052: substitui sessão após troca de senha", async () => {
    const { auth, storage } = setup();
    expect(await auth.changePassword({ password: "nova-senha" })).toEqual(session);
    expect(storage.saveSession).toHaveBeenCalledWith(session);
  });

  it("CT-053: guarda sessão após confirmação do e-mail", async () => {
    const { auth, storage } = setup();
    expect(await auth.verifyEmail({ email: "cliente@example.test", code: "123456" })).toEqual(
      session,
    );
    expect(storage.saveSession).toHaveBeenCalledWith(session);
  });

  it("CT-054: encerra sessão local", () => {
    const { auth, storage } = setup();
    auth.signOut();
    expect(storage.clearSession).toHaveBeenCalledOnce();
  });
});
