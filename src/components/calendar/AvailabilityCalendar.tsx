import { useEffect, useMemo, useState } from "react"
import { availabilityService } from "../../services/availability/availabilityService"
import type { DayAvailability, Professional, Service, SlotAvailability } from "../../features/shared/types"

type ProfessionalOption = Pick<Professional, "_id" | "name" | "especialidade" | "horario_inicio" | "horario_fim">
type ServiceOption = Pick<Service, "_id" | "name" | "duracao_min" | "preco">

interface ScheduleValue {
  servico: string
  profissional: string
  data_hora: string
}

interface CalendarProps {
  professionals: ProfessionalOption[]
  services: ServiceOption[]
  value: ScheduleValue
  onChange: (next: ScheduleValue) => void
  disabled?: boolean
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function buildMonthDays(anchor: Date) {
  const firstDay = startOfMonth(anchor)
  const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()
  const startOffset = firstDay.getDay()
  const cells: Array<Date | null> = []

  for (let index = 0; index < startOffset; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(anchor.getFullYear(), anchor.getMonth(), day))
  }

  return cells
}

export function AvailabilityCalendar({ professionals, services, value, onChange, disabled = false }: CalendarProps) {
  const [monthAnchor, setMonthAnchor] = useState(() => {
    if (value.data_hora) {
      return new Date(value.data_hora)
    }

    return new Date()
  })
  const [monthDays, setMonthDays] = useState<DayAvailability[]>([])
  const [slots, setSlots] = useState<SlotAvailability[]>([])
  const [selectedDate, setSelectedDate] = useState(() => value.data_hora ? value.data_hora.slice(0, 10) : "")
  const [loadingMonth, setLoadingMonth] = useState(false)
  const [loadingDay, setLoadingDay] = useState(false)
  const [calendarMessage, setCalendarMessage] = useState("Selecione profissional e serviço para ver os horários disponíveis")

  const selectedService = services.find((item) => item._id === value.servico)
  const selectedProfessional = professionals.find((item) => item._id === value.profissional)
  const hasPrerequisites = Boolean(value.profissional && value.servico)

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(monthAnchor)
  }, [monthAnchor])

  useEffect(() => {
    if (!value.profissional || !value.servico) {
      const timeout = window.setTimeout(() => {
        setMonthDays([])
        setSlots([])
        setCalendarMessage("Escolha um serviço e um profissional para carregar a agenda")
      }, 0)

      return () => window.clearTimeout(timeout)
    }

    let active = true
    void Promise.resolve().then(() => {
      if (active) setLoadingMonth(true)
    })

    availabilityService.getMonthAvailability({
      profissionalId: value.profissional,
      servicoId: value.servico,
      month: toMonthKey(monthAnchor),
    })
      .then((days) => {
        if (!active) return
        setMonthDays(days)
        setCalendarMessage("Clique em um dia para ver os horários livres")
      })
      .catch(() => {
        if (!active) return
        setMonthDays([])
        setCalendarMessage("Não foi possível carregar o calendário")
      })
      .finally(() => {
        if (!active) return
        setLoadingMonth(false)
      })

    return () => {
      active = false
    }
  }, [monthAnchor, value.profissional, value.servico])

  useEffect(() => {
    if (!value.profissional || !value.servico || !selectedDate) {
      const timeout = window.setTimeout(() => setSlots([]), 0)

      return () => window.clearTimeout(timeout)
    }

    let active = true
    void Promise.resolve().then(() => {
      if (active) setLoadingDay(true)
    })

    availabilityService.getDayAvailability({
      profissionalId: value.profissional,
      servicoId: value.servico,
      date: selectedDate,
    })
      .then((response) => {
        if (!active) return
        setSlots(response.slots)
        setCalendarMessage(response.available ? "Escolha um horário disponível" : "Nenhum horário disponível para este dia")
      })
      .catch(() => {
        if (!active) return
        setSlots([])
        setCalendarMessage("Não foi possível carregar os horários")
      })
      .finally(() => {
        if (!active) return
        setLoadingDay(false)
      })

    return () => {
      active = false
    }
  }, [selectedDate, value.profissional, value.servico])

  const cells = buildMonthDays(monthAnchor)

  function selectDay(date: Date) {
    const dateKey = toDateKey(date)
    setSelectedDate(dateKey)
    setSlots([])
    onChange({
      ...value,
      data_hora: "",
    })
    setMonthAnchor(date)
  }

  function selectSlot(slot: SlotAvailability) {
    if (disabled || !slot.available) return
    onChange({
      ...value,
      data_hora: slot.datetime.slice(0, 16),
    })
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          <span>Profissional *</span>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={value.profissional}
            onChange={(event) => { setSelectedDate(""); onChange({ ...value, profissional: event.target.value, data_hora: "" }) }}
            required
            disabled={disabled}
          >
            <option value="">Selecione o profissional</option>
            {professionals.map((professional) => (
              <option key={professional._id} value={professional._id}>
                {professional.name} - {professional.especialidade}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-bold text-slate-700">
          <span>Serviço *</span>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={value.servico}
            onChange={(event) => { setSelectedDate(""); onChange({ ...value, servico: event.target.value, data_hora: "" }) }}
            required
            disabled={disabled}
          >
            <option value="">Selecione o serviço</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} - {service.duracao_min} min - R$ {Number(service.preco).toFixed(2)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!hasPrerequisites && (
        <div className="rounded-[1.75rem] border border-dashed border-blue-200 bg-blue-50 p-5 text-blue-900">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Calendário</p>
          <h3 className="mt-2 text-xl font-black">Preencha os campos acima para visualizar os horários</h3>
          <p className="mt-2 text-sm text-blue-900/80">
            O calendário só aparece depois de escolher profissional e serviço. Assim evitamos mostrar vários dias vazios e a tela fica mais clara para o usuário.
          </p>
        </div>
      )}

      {hasPrerequisites && (
        <>
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Calendário personalizado</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">{monthLabel}</h3>
                <p className="mt-1 text-sm text-slate-600">{calendarMessage}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700" type="button" onClick={() => setMonthAnchor((current) => addMonths(current, -1))} disabled={disabled || loadingMonth}>Mês anterior</button>
                <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700" type="button" onClick={() => setMonthAnchor((current) => addMonths(current, 1))} disabled={disabled || loadingMonth}>Próximo mês</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label) => <div key={label}>{label}</div>)}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {cells.map((cell, index) => {
                if (!cell) {
                  return <div key={`empty-${index}`} className="rounded-2xl bg-transparent p-3" />
                }

                const dateKey = toDateKey(cell)
                const dayInfo = monthDays.find((item) => item.date === dateKey)
                const isSelected = selectedDate === dateKey
                const isAvailable = Boolean(dayInfo?.available)
                const workingDay = dayInfo?.workingDay ?? false

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => selectDay(cell)}
                    disabled={disabled || loadingMonth || !workingDay || !isAvailable}
                    aria-label={`${dateKey}: ${isAvailable ? `${dayInfo?.slotsCount ?? 0} horários disponíveis` : workingDay ? "sem horários disponíveis" : "folga"}`}
                    aria-pressed={isSelected}
                    className={`rounded-2xl border p-3 text-left transition ${isSelected ? "border-blue-500 bg-blue-600 text-white shadow-sm" : workingDay ? "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50" : "border-dashed border-slate-200 bg-slate-100 text-slate-400"}`}
                  >
                    <span className="block text-sm font-black">{cell.getDate()}</span>
                    <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.18em]">
                      {workingDay ? (isAvailable ? `${dayInfo?.slotsCount ?? 0} vagas` : "Sem vagas") : "Folga"}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Horários disponíveis</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">
                  {selectedDate || "Selecione um dia"}
                </h3>
                <p className="mt-1 text-sm text-slate-600" aria-live="polite">
                  {selectedProfessional ? `${selectedProfessional.name}${selectedProfessional.especialidade ? ` - ${selectedProfessional.especialidade}` : ""}` : "Escolha um profissional"}
                  {selectedService ? ` • ${selectedService.name} (${selectedService.duracao_min} min)` : ""}
                </p>
              </div>
              {loadingDay && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Carregando...</span>}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {slots.filter((slot) => slot.available).map((slot) => (
                <button
                  key={slot.datetime}
                  type="button"
                  onClick={() => selectSlot(slot)}
                  disabled={disabled}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${value.data_hora === slot.datetime.slice(0, 16) ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50"}`}
                >
                  <span className="block text-sm font-black">{slot.time}</span>
                  <span className="block text-xs font-medium opacity-80">Disponível</span>
                </button>
              ))}
            </div>

            {!loadingDay && slots.filter((slot) => slot.available).length === 0 && selectedDate && (
              <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Nenhum horário livre para esta data. Tente outro dia ou outro profissional.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
