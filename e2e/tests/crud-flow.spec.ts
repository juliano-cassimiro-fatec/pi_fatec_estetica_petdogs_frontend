import { expect, test, type Page, type Route } from "@playwright/test"

type JsonRecord = Record<string, unknown>

const admin = { id: "admin-e2e", name: "Admin Playwright", email: "admin@petdogs.test", role: "admin" }
const customerUser = { id: "customer-e2e", name: "Cliente E2E", email: "cliente.e2e@petdogs.test", role: "cliente" }

function installApi(page: Page) {
  const state = {
    user: admin,
    services: [] as JsonRecord[],
    professionals: [] as JsonRecord[],
    customers: [] as JsonRecord[],
    pets: [] as JsonRecord[],
    schedules: [] as JsonRecord[],
    mutations: [] as string[],
  }

  const collections: Record<string, JsonRecord[]> = {
    servicos: state.services,
    profissionais: state.professionals,
    clientes: state.customers,
    pets: state.pets,
  }

  async function json(route: Route, body: unknown, status = 200) {
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) })
  }

  page.route("**/api/v1/**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace(/^\/api\/v1\/?/, "")
    const method = request.method()

    if (path === "auth/login" && method === "POST") {
      const credentials = request.postDataJSON() as { email: string; password: string }
      expect(credentials.password).toBe("senha123")
      state.user = credentials.email === admin.email ? admin : customerUser
      return json(route, { token: `token-${state.user.role}`, user: state.user })
    }
    if (path === "auth/me") return json(route, { user: state.user })
    if (path === "clientes/me") {
      return json(route, state.customers.find((item) => item._id === state.user.id) ?? { _id: customerUser.id, ...customerUser })
    }
    if (path === "agendamentos/disponibilidade/mes") {
      const [year, month] = (url.searchParams.get("month") ?? "2026-08").split("-").map(Number)
      const lastDay = new Date(year, month, 0).getDate()
      return json(route, {
        month: url.searchParams.get("month"),
        days: Array.from({ length: lastDay }, (_, index) => ({
          date: `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
          available: true,
          slotsCount: 1,
          workingDay: true,
        })),
      })
    }
    if (path === "agendamentos/disponibilidade") {
      const date = url.searchParams.get("date")
      return json(route, { available: true, slots: [{ time: "10:00", datetime: `${date}T10:00:00.000Z`, available: true }] })
    }

    if (path === "agendamentos" && method === "GET") return json(route, state.schedules)
    if (path === "agendamentos" && method === "POST") {
      state.mutations.push("POST /agendamentos")
      const payload = request.postDataJSON() as JsonRecord
      state.schedules.push({
        _id: "schedule-e2e", status: "scheduled", data_hora: payload.data_hora,
        animal: state.pets.find((item) => item._id === payload.animal),
        servico: state.services.find((item) => item._id === payload.servico),
        profissional: state.professionals.find((item) => item._id === payload.profissional),
        cliente: state.customers[0],
      })
      return json(route, {}, 201)
    }
    const scheduleMatch = path.match(/^agendamentos\/([^/]+)(\/cancel)?$/)
    if (scheduleMatch && method === "PUT") {
      state.mutations.push("PUT /agendamentos")
      const payload = request.postDataJSON() as JsonRecord
      const schedule = state.schedules.find((item) => item._id === scheduleMatch[1])
      if (schedule) schedule.data_hora = payload.data_hora
      return json(route, {})
    }
    if (scheduleMatch?.[2] && method === "PATCH") {
      state.mutations.push("PATCH /agendamentos/cancel")
      const schedule = state.schedules.find((item) => item._id === scheduleMatch[1])
      if (schedule) schedule.status = "canceled"
      return json(route, {})
    }

    const [resource, id] = path.split("/")
    const collection = collections[resource]
    if (!collection) return json(route, [])
    if (method === "GET") return json(route, collection)
    if (method === "POST") {
      state.mutations.push(`POST /${resource}`)
      const payload = request.postDataJSON() as JsonRecord
      const created: JsonRecord = { _id: `${resource}-e2e`, ...payload }
      if (resource === "pets") created.cliente = state.customers.find((item) => item._id === payload.cliente)
      collection.push(created)
      return json(route, created, 201)
    }
    if (method === "PUT") {
      state.mutations.push(`PUT /${resource}`)
      const index = collection.findIndex((item) => item._id === id)
      const payload = request.postDataJSON() as JsonRecord
      collection[index] = { ...collection[index], ...payload }
      if (resource === "pets") collection[index].cliente = state.customers.find((item) => item._id === payload.cliente)
      return json(route, collection[index])
    }
    if (method === "DELETE") {
      state.mutations.push(`DELETE /${resource}`)
      const index = collection.findIndex((item) => item._id === id)
      if (index >= 0) collection.splice(index, 1)
      return json(route, {})
    }
    return json(route, {})
  })

  return state
}

async function login(page: Page, email: string) {
  await page.goto("/login")
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("Senha").fill("senha123")
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(page).toHaveURL(/\/app\/dashboard$/)
}

async function openTab(page: Page, name: string) {
  await page.getByRole("navigation").getByRole("button", { name, exact: true }).click()
}

test("percorre login e CRUD completo, deixando todas as exclusões para o final", async ({ page }) => {
  const api = installApi(page)
  await login(page, admin.email)
  await expect(page.getByRole("heading", { name: "Painel administrativo" })).toBeVisible()

  await openTab(page, "Serviços")
  await page.getByLabel("Nome do serviço *").fill("Banho E2E")
  await page.getByLabel("Descrição *").fill("Banho criado pelo Playwright")
  await page.getByLabel("Duração *").fill("45")
  await page.getByLabel("Preço *").fill("70")
  await page.getByRole("button", { name: "Cadastrar serviço" }).click()
  let card = page.getByRole("article").filter({ hasText: "Banho E2E" })
  await expect(card).toBeVisible()
  await card.getByRole("button", { name: "Editar" }).click()
  const serviceDialog = page.getByRole("dialog")
  await serviceDialog.getByLabel("Nome do serviço *").fill("Banho E2E atualizado")
  await serviceDialog.getByRole("button", { name: "Salvar alterações" }).click()
  await expect(page.getByText("Banho E2E atualizado")).toBeVisible()

  await openTab(page, "Profissionais")
  await page.getByLabel("Nome *").fill("Profissional E2E")
  await page.getByLabel("E-mail *").fill("profissional@e2e.test")
  await page.getByLabel("Senha inicial *").fill("senha123")
  await page.getByLabel("Especialidade *").fill("Tosa")
  await page.getByRole("button", { name: "Criar profissional" }).click()
  card = page.getByRole("article").filter({ hasText: "Profissional E2E" })
  await card.getByRole("button", { name: "Editar" }).click()
  const professionalDialog = page.getByRole("dialog")
  await professionalDialog.getByLabel("Especialidade *").fill("Banho e tosa")
  await professionalDialog.getByRole("button", { name: "Salvar alterações" }).click()
  await expect(page.getByText("Banho e tosa")).toBeVisible()

  await openTab(page, "Clientes")
  await page.getByLabel("Nome *").fill(customerUser.name)
  await page.getByLabel("E-mail *").fill(customerUser.email)
  await page.getByLabel("Senha inicial *").fill("senha123")
  await page.getByLabel("Telefone").fill("11999990000")
  await page.getByRole("button", { name: "Cadastrar cliente" }).click()
  card = page.getByRole("article").filter({ hasText: customerUser.name })
  await card.getByRole("button", { name: "Editar" }).click()
  const customerDialog = page.getByRole("dialog")
  await customerDialog.getByLabel("Telefone").fill("11888880000")
  await customerDialog.getByRole("button", { name: "Salvar alterações" }).click()
  await expect(page.getByText("11888880000")).toBeVisible()

  await openTab(page, "Pets")
  await page.getByLabel("Tutor *").selectOption({ label: customerUser.name })
  await page.getByLabel("Nome *").fill("Pet E2E")
  await page.getByLabel("Raça *").fill("Vira-lata")
  await page.getByLabel("Idade *").fill("4")
  await page.getByLabel("Porte *").selectOption("medio")
  await page.getByRole("button", { name: "Cadastrar pet" }).click()
  card = page.getByRole("article").filter({ hasText: "Pet E2E" })
  await card.getByRole("button", { name: "Editar" }).click()
  const petDialog = page.getByRole("dialog")
  await petDialog.getByLabel("Raça *").fill("SRD")
  await petDialog.getByRole("button", { name: "Salvar alterações" }).click()
  await expect(page.getByText(/SRD/)).toBeVisible()

  await page.getByRole("button", { name: "Sair" }).click()
  await login(page, customerUser.email)
  await page.getByRole("button", { name: "Abrir calendário" }).click()
  const scheduleDialog = page.getByRole("dialog")
  await scheduleDialog.getByLabel("Pet *").selectOption({ label: "Pet E2E" })
  await scheduleDialog.getByLabel("Profissional *").selectOption({ label: /Profissional E2E/ })
  await scheduleDialog.getByLabel("Serviço *").selectOption({ label: /Banho E2E atualizado/ })
  const availableDay = scheduleDialog.getByRole("button", { name: /horários disponíveis/ }).first()
  await availableDay.click()
  await scheduleDialog.getByRole("button", { name: /10:00/ }).click()
  await scheduleDialog.getByRole("button", { name: "Confirmar agendamento" }).click()
  await expect(page.getByText("Agendamento realizado com sucesso")).toBeVisible()

  card = page.getByRole("article").filter({ hasText: "Pet E2E" })
  await card.getByRole("button", { name: "Editar" }).click()
  const editScheduleDialog = page.getByRole("dialog")
  await editScheduleDialog.getByRole("button", { name: /horários disponíveis/ }).first().click()
  await editScheduleDialog.getByRole("button", { name: /10:00/ }).click()
  await editScheduleDialog.getByRole("button", { name: "Salvar agendamento" }).click()
  await card.getByRole("button", { name: "Cancelar" }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Cancelar agendamento" }).click()
  await expect(page.getByText("Agendamento cancelado")).toBeVisible()

  // Limpeza deliberadamente no fim: evita remover dependências enquanto o CRUD ainda está em execução.
  await page.getByRole("button", { name: "Sair" }).click()
  await login(page, admin.email)
  for (const [tab, record, confirmation] of [
    ["Pets", "Pet E2E", "Excluir pet"],
    ["Clientes", customerUser.name, "Excluir cliente"],
    ["Profissionais", "Profissional E2E", "Excluir profissional"],
    ["Serviços", "Banho E2E atualizado", "Excluir serviço"],
  ]) {
    await openTab(page, tab)
    const resourceCard = page.getByRole("article").filter({ hasText: record })
    await resourceCard.getByRole("button", { name: "Excluir" }).click()
    await page.getByRole("dialog").getByRole("button", { name: confirmation }).click()
    await expect(resourceCard).toHaveCount(0)
  }

  const firstDelete = api.mutations.findIndex((entry) => entry.startsWith("DELETE"))
  expect(firstDelete).toBeGreaterThan(-1)
  expect(api.mutations.slice(firstDelete).every((entry) => entry.startsWith("DELETE"))).toBe(true)
})
