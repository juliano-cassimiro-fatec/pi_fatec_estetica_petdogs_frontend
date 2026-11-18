import { expect, test } from "@playwright/test";
import { createCustomer, signInCustomer, useAdminSession } from "./helpers";

test("CT-020: administrador cadastra cliente", async ({ page }) => {
  await useAdminSession(page);
  await page.getByRole("button", { name: "Clientes", exact: true }).click();
  await page.getByRole("button", { name: "Novo cliente" }).click();
  const dialog = page.getByRole("dialog", { name: "Novo cliente" });
  await dialog.getByLabel("Nome *").fill("Cliente cadastrado");
  await dialog.getByLabel("E-mail *").fill("criado@example.test");
  await dialog.getByLabel("Senha inicial *").fill("senha-inicial-123");
  await dialog.getByRole("button", { name: "Cadastrar cliente" }).click();
  await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Clientes", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Cliente cadastrado" })).toBeVisible();
});

test("CT-021: cliente troca senha provisória", async ({ page, request }) => {
  await createCustomer(request, "troca@example.test");
  await signInCustomer(page, "troca@example.test");
  await page.getByLabel("Nova senha", { exact: true }).fill("senha-pessoal-123");
  await page.getByLabel("Confirmar nova senha").fill("senha-pessoal-123");
  await page.getByRole("button", { name: "Criar nova senha" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard$/);
  await expect(page.getByRole("dialog", { name: "Cadastrar cão" })).toBeVisible();
});

test("CT-022: cliente cadastra cão e verifica persistência", async ({ page, request }) => {
  await createCustomer(request, "tutor@example.test");
  await signInCustomer(page, "tutor@example.test");
  await page.getByLabel("Nova senha", { exact: true }).fill("senha-pessoal-123");
  await page.getByLabel("Confirmar nova senha").fill("senha-pessoal-123");
  await page.getByRole("button", { name: "Criar nova senha" }).click();
  const dialog = page.getByRole("dialog", { name: "Cadastrar cão" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Nome do cão *").fill("Luna");
  await dialog.getByLabel("Raça *").selectOption({ label: "Poodle" });
  await dialog.getByLabel("Data de nascimento *").fill("2022-01-15");
  await dialog.getByRole("button", { name: "Cadastrar cão" }).click();
  await expect(dialog).toBeHidden();
  await page.reload();
  await page.getByRole("button", { name: "Cães", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Luna" })).toBeVisible();
});
