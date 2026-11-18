import { expect, type APIRequestContext, type Page } from "@playwright/test";
import type { AuthSession } from "../../src/services/types";

function adminSession(): AuthSession {
  const value = process.env.PETDOGS_E2E_ADMIN_SESSION;
  if (!value) throw new Error("Sessão administrativa de teste não foi inicializada");
  return JSON.parse(value) as AuthSession;
}

export async function useAdminSession(page: Page) {
  await page.goto("/login");
  await page.evaluate((session: AuthSession) => {
    localStorage.setItem("petshop-token", session.token);
    localStorage.setItem("user", JSON.stringify(session.user));
  }, adminSession());
  await page.goto("/app/dashboard");
  await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
}

export async function createService(request: APIRequestContext, name: string) {
  const response = await request.post("/api/v1/servicos", {
    headers: { Authorization: `Bearer ${adminSession().token}` },
    data: { name, descricao: "Serviço de teste", duracao_min: 30, preco: 50 },
  });
  expect(response.status()).toBe(201);
}

export async function createCustomer(request: APIRequestContext, email: string) {
  const response = await request.post("/api/v1/clientes", {
    headers: { Authorization: `Bearer ${adminSession().token}` },
    data: { name: "Cliente de teste", email, senha: "senha-inicial-123" },
  });
  expect(response.status()).toBe(201);
  return (await response.json()) as { _id: string };
}

export async function createSchedulingFixture(request: APIRequestContext) {
  const headers = { Authorization: `Bearer ${adminSession().token}` };
  const customer = await createCustomer(request, "agenda@example.test");
  const dog = await request.post("/api/v1/caes", {
    headers,
    data: {
      nome: "Cão da agenda",
      raca: "Poodle",
      data_nascimento: "2022-01-15",
      porte: "pequeno",
      cliente: customer._id,
    },
  });
  expect(dog.status()).toBe(201);
  await createService(request, "Banho da agenda");
  const professional = await request.post("/api/v1/profissionais", {
    headers,
    data: {
      name: "Profissional da agenda",
      email: "profissional@example.test",
      senha: "senha-inicial-123",
      especialidade: "Banho",
      dias_trabalho: [0, 1, 2, 3, 4, 5, 6],
      horario_inicio: "08:00",
      horario_fim: "18:00",
    },
  });
  expect(professional.status()).toBe(201);
  const login = await request.post("/api/v1/auth/login", {
    data: { email: "agenda@example.test", password: "senha-inicial-123" },
  });
  expect(login.status()).toBe(200);
  const initialSession = (await login.json()) as AuthSession;
  const change = await request.post("/api/v1/auth/change-password", {
    headers: { Authorization: `Bearer ${initialSession.token}` },
    data: { password: "senha-pessoal-123" },
  });
  expect(change.status()).toBe(200);
  return (await change.json()) as AuthSession;
}

export async function useSession(page: Page, session: AuthSession) {
  await page.goto("/login");
  await page.evaluate((value: AuthSession) => {
    localStorage.setItem("petshop-token", value.token);
    localStorage.setItem("user", JSON.stringify(value.user));
  }, session);
  await page.goto("/app/dashboard");
}

export async function signInCustomer(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("senha-inicial-123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/change-password$/);
}
