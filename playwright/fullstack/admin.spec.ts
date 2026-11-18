import { expect, test } from "@playwright/test";
import { createService, useAdminSession } from "./helpers";

test("CT-015: administrador autentica na API real", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("admin@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("test-password-123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
});

test.describe("serviços do administrador", () => {
  test.beforeEach(async ({ page }) => {
    await useAdminSession(page);
    await page.getByRole("button", { name: "Serviços", exact: true }).click();
  });

  test("CT-016: cadastrar serviço e verificar persistência", async ({ page }) => {
    await page.getByRole("button", { name: "Novo serviço" }).click();
    const dialog = page.getByRole("dialog", { name: "Novo serviço" });
    await dialog.getByLabel("Nome do serviço *").fill("Banho criado");
    await dialog.getByLabel("Descrição *").fill("Banho para teste isolado");
    await dialog.getByLabel("Duração (min) *").fill("30");
    await dialog.getByLabel("Preço *").fill("50");
    await dialog.getByRole("button", { name: "Cadastrar serviço" }).click();
    await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "Serviços", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Banho criado" })).toBeVisible();
  });

  test("CT-017: editar serviço persistido", async ({ page, request }) => {
    await createService(request, "Banho para editar");
    await page.reload();
    await page.getByRole("button", { name: "Serviços", exact: true }).click();
    await page
      .locator("article")
      .filter({ hasText: "Banho para editar" })
      .getByRole("button", { name: "Editar" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Editar serviço" });
    await dialog.getByLabel("Nome do serviço *").fill("Banho editado");
    await dialog.getByRole("button", { name: "Salvar alterações" }).click();
    await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "Serviços", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Banho editado" })).toBeVisible();
  });

  test("CT-018: excluir serviço persistido", async ({ page, request }) => {
    await createService(request, "Banho para excluir");
    await page.reload();
    await page.getByRole("button", { name: "Serviços", exact: true }).click();
    await page
      .locator("article")
      .filter({ hasText: "Banho para excluir" })
      .getByRole("button", { name: "Excluir" })
      .click();
    await page.getByRole("dialog").getByRole("button", { name: "Excluir serviço" }).click();
    await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "Serviços", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Banho para excluir" })).toHaveCount(0);
  });
});

test("CT-019: encerrar sessão administrativa", async ({ page }) => {
  await useAdminSession(page);
  await page.getByRole("button", { name: "Sair" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("petshop-token"))).toBeNull();
});
