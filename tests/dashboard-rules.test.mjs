import assert from "node:assert/strict"
import test from "node:test"
import { can } from "../src/features/dashboard/permissions.ts"
import { validateWorkSchedule } from "../src/features/dashboard/dashboardConfig.ts"

test("permissões de agenda respeitam cada papel", () => {
  assert.equal(can("cliente", "schedule:create"), true)
  assert.equal(can("profissional", "schedule:edit"), false)
  assert.equal(can("admin", "customer:manage"), true)
  assert.equal(can(undefined, "pet:manage"), false)
})

test("valida expediente e intervalo de almoço", () => {
  assert.equal(validateWorkSchedule({ dias_trabalho: [], horario_inicio: "08:00", horario_fim: "18:00" }), "Selecione ao menos um dia de trabalho")
  assert.equal(validateWorkSchedule({ dias_trabalho: [1], horario_inicio: "18:00", horario_fim: "08:00" }), "A hora inicial deve ser anterior à hora final")
  assert.equal(validateWorkSchedule({ dias_trabalho: [1], horario_inicio: "08:00", horario_fim: "18:00", almoco_inicio: "13:00", almoco_fim: "12:00" }), "O início do almoço deve ser anterior ao retorno")
  assert.equal(validateWorkSchedule({ dias_trabalho: [1], horario_inicio: "08:00", horario_fim: "18:00", almoco_inicio: "12:00", almoco_fim: "13:00" }), "")
})
