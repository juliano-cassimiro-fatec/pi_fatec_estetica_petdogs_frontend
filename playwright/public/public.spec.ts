import { expect, test } from "@playwright/test";

test("CT-011: página inicial mostra serviços", async ({ page }) => {
  await page.route("**/api/v1/servicos", (route) =>
    route.fulfill({
      json: [{ _id: "1", name: "Banho especial", descricao: "Cuidado completo", preco: 50 }],
    }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Cuidado e carinho para o seu cão." }),
  ).toBeVisible();
  await expect(page.getByText("Banho especial")).toBeVisible();
});

test("CT-012: página inicial permite acessar o login", async ({ page }) => {
  await page.route("**/api/v1/servicos", (route) => route.fulfill({ json: [] }));
  await page.goto("/");
  await page.getByRole("link", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Bem-vindo de volta" })).toBeVisible();
});

test("CT-013: login exibe erro retornado pela API", async ({ page }) => {
  await page.route("**/api/v1/auth/login", (route) =>
    route.fulfill({ status: 401, json: { message: "Credenciais inválidas" } }),
  );
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("pessoa@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("senha-incorreta");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Credenciais inválidas");
  await expect(page).toHaveURL(/\/login$/);
});

test("CT-014: link legal abre a política de privacidade", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Política de Privacidade" }).click();
  await expect(page).toHaveURL(/\/politica-de-privacidade$/);
  await expect(page.getByRole("heading", { name: "Política de Privacidade" })).toBeVisible();
});
