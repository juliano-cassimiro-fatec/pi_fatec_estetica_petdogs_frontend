import { expect, test } from "@playwright/test"

test.describe("páginas públicas", () => {
  test("exibe a landing page e navega para os serviços", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveTitle(/PetDog's Estetica Animal/)
    await expect(page.getByRole("heading", { name: /Banho e Tosa com Cuidado Profissional/i })).toBeVisible()
    await page.getByRole("link", { name: "Ver servicos" }).click()
    await expect(page).toHaveURL(/#servicos$/)
    await expect(page.getByRole("heading", { name: /Tudo que seu pet precisa/i })).toBeVisible()
  })

  test("direciona visitante sem sessão para o login", async ({ page }) => {
    await page.goto("/app/dashboard")

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole("heading", { name: "Entrar na conta", exact: true }).first()).toBeVisible()
  })

  test("exibe a página de rota inexistente", async ({ page }) => {
    await page.goto("/pagina-inexistente")

    await expect(page.getByText("Página não encontrada")).toBeVisible()
    await expect(page.getByRole("link", { name: /Voltar ao início/i })).toBeVisible()
  })
})
