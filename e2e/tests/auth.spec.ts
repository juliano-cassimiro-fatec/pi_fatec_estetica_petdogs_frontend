import { expect, test } from "@playwright/test"

const customer = {
  id: "customer-e2e",
  name: "Cliente Playwright",
  email: "cliente@petdogs.test",
  role: "cliente",
}

test.describe("autenticação", () => {
  test("exige a verificação do e-mail antes de criar a conta", async ({ page }) => {
    await page.route("**/api/v1/auth/otp/send", async (route) => {
      expect(route.request().postDataJSON()).toEqual({ email: customer.email })
      await route.fulfill({ json: { message: "Código enviado para o e-mail" } })
    })
    await page.route("**/api/v1/auth/otp/verify", async (route) => {
      expect(route.request().postDataJSON()).toEqual({ email: customer.email, codigo: "123456" })
      await route.fulfill({ json: { message: "E-mail verificado com sucesso", verified: true, verificationToken: "verification-token-e2e" } })
    })
    await page.route("**/api/v1/auth/register", async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        name: customer.name,
        email: customer.email,
        password: "senha123",
        verificationToken: "verification-token-e2e",
      })
      await route.fulfill({ json: { token: "token-e2e", user: customer } })
    })

    await page.goto("/register")
    await page.getByLabel("E-mail").fill(`  ${customer.email.toUpperCase()}  `)
    await page.getByRole("button", { name: "Enviar código" }).click()
    await expect(page.getByRole("status")).toContainText("Código enviado")

    await page.getByLabel("Código de verificação").fill("123456")
    await page.getByRole("button", { name: "Validar código" }).click()
    await expect(page.getByRole("status")).toContainText("E-mail verificado")

    await page.getByLabel("Nome").fill(customer.name)
    await page.getByLabel("Senha").fill("senha123")
    await page.getByRole("button", { name: "Criar cadastro" }).click()
    await expect(page).toHaveURL(/\/app\/dashboard$/)
  })

  test("realiza login e abre o painel do cliente", async ({ page }) => {
    await page.route("**/api/v1/**", async (route) => {
      const pathname = new URL(route.request().url()).pathname
      if (pathname.endsWith("/auth/me")) {
        await route.fulfill({ json: { user: customer } })
        return
      }
      if (pathname.endsWith("/clientes/me")) {
        await route.fulfill({ json: { _id: customer.id, ...customer } })
        return
      }
      await route.fulfill({ json: [] })
    })
    await page.route("**/api/v1/auth/login", async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        email: customer.email,
        password: "senha123",
      })
      await route.fulfill({ json: { token: "token-e2e", user: customer } })
    })

    await page.goto("/login")
    await page.getByLabel("E-mail").fill(customer.email)
    await page.getByLabel("Senha").fill("senha123")
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page).toHaveURL(/\/app\/dashboard$/)
    await expect(page.getByText("Área do cliente")).toBeVisible()
    await expect.poll(() => page.evaluate(() => localStorage.getItem("petshop-token"))).toBe("token-e2e")
  })

  test("apresenta a mensagem devolvida quando o login falha", async ({ page }) => {
    await page.route("**/api/v1/auth/login", (route) => route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "E-mail ou senha inválidos" }),
    }))

    await page.goto("/login")
    await page.getByLabel("E-mail").fill("incorreto@petdogs.test")
    await page.getByLabel("Senha").fill("senha-incorreta")
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page.getByRole("alert")).toContainText("E-mail ou senha inválidos")
    await expect(page).toHaveURL(/\/login$/)
  })
})
