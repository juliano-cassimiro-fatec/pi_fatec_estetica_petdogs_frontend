import { expect, test } from "@playwright/test";
import { createSchedulingFixture, useSession } from "./helpers";

test("CT-033: cliente agenda atendimento em horário disponível", async ({ page, request }) => {
  const session = await createSchedulingFixture(request);
  await useSession(page, session);
  await page.getByRole("button", { name: "Agenda", exact: true }).click();
  await page.getByRole("button", { name: "Próximo mês" }).click();
  const date = new Date();
  const day = new Date(date.getFullYear(), date.getMonth() + 1, 10);
  const label = day.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  await page.getByRole("button", { name: `${label}, sem agendamentos` }).click();
  await page.getByRole("button", { name: "Novo agendamento" }).click();
  const dialog = page.getByRole("dialog", { name: "Novo agendamento" });
  await dialog.getByLabel("Cão *").selectOption({ label: "Cão da agenda" });
  await dialog.getByRole("combobox", { name: "Profissional", exact: true }).selectOption({
    label: "Profissional da agenda",
  });
  await dialog.getByRole("combobox", { name: "Serviço", exact: true }).selectOption({
    label: "Banho da agenda · 30 min",
  });
  await dialog.getByRole("button", { name: "08:00", exact: true }).click();
  await dialog.getByRole("button", { name: "Confirmar agendamento" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Cão da agenda", { exact: false }).first()).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Agenda", exact: true }).click();
  await page.getByRole("button", { name: "Próximo mês" }).click();
  await page.getByRole("button", { name: `${label}, 1 agendamentos` }).click();
  await expect(page.locator("article").filter({ hasText: "Cão da agenda" })).toContainText(
    "Banho da agenda",
  );
});
