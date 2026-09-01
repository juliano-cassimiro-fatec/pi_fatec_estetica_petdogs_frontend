import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AvailabilityCalendar } from "../../components/calendar/AvailabilityCalendar";
import { Modal } from "../../components/ui/Modal";
import { SiteHeader, SiteShell } from "../../components/layout/UnifiedPageFrame";
import type {
  AuthUser,
  Customer,
  Pet,
  Professional,
  Schedule,
  Service,
} from "../../features/shared/types";
import { dashboardService } from "../../services/dashboard/dashboardService";
import { useAuth } from "../../services/auth/useAuth";
import { isUnauthorizedError, presentRequestError } from "../../services/api/errors";
import { emptyProfileForm, presentProfileForm } from "../../features/dashboard/profileForm";
import Card from "../../components/ui/Card";
import Icon from "../../components/ui/Icon";
import Field from "../../components/ui/Field";
import PasswordInput from "../../components/ui/PasswordInput";
import PhotoPreview from "../../components/ui/PhotoPreview";
import {
  buttonClass,
  dangerButtonClass,
  emptyClientForm,
  emptyPetForm,
  emptyProfessionalForm,
  emptyServiceForm,
  formatCurrency,
  getDashboardMode,
  inputClass,
  readImage,
  secondaryButtonClass,
  validateWorkSchedule,
  weekdayOptions,
  type ConfirmModalState,
  type DashboardTab,
  type ScheduleFormState,
  type TabKey,
} from "../../features/dashboard/dashboardConfig";
import {
  DashboardFeedback,
  DashboardHeader,
  DashboardMetrics,
  DashboardNavigation,
  HeaderUserSummary,
} from "../../components/dashboard/DashboardChrome";
import { can } from "../../features/dashboard/permissions";

export function DashboardPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("agenda");
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [petForm, setPetForm] = useState(emptyPetForm());
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [petEditModalOpen, setPetEditModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>({
    animal: "",
    servico: "",
    profissional: "",
    data_hora: "",
  });
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm());
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceEditModalOpen, setServiceEditModalOpen] = useState(false);
  const [professionalForm, setProfessionalForm] = useState(emptyProfessionalForm());
  const [editingProfessionalId, setEditingProfessionalId] = useState<string | null>(null);
  const [professionalEditModalOpen, setProfessionalEditModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState(emptyClientForm());
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientEditModalOpen, setClientEditModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfileForm());
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  const isAdmin = user?.role === "admin";
  const isProfessional = user?.role === "profissional";
  const isCustomer = user?.role === "cliente";
  const dashboardMode = getDashboardMode(user?.role);
  const availableTabs: DashboardTab[] = [
    { key: "agenda", label: "Agenda", icon: "calendar", show: true },
    { key: "servicos", label: "Serviços", icon: "services", show: isAdmin || isCustomer },
    { key: "profissionais", label: "Profissionais", icon: "users", show: isAdmin || isCustomer },
    { key: "clientes", label: "Clientes", icon: "clients", show: isAdmin },
    { key: "pets", label: "Pets", icon: "pets", show: isAdmin || isCustomer },
    { key: "perfil", label: "Perfil", icon: "settings", show: isCustomer || isProfessional },
  ];

  const logout = useCallback(() => {
    auth.signOut();
    setUser(null);
    navigate("/login", { replace: true });
  }, [auth, navigate]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const dashboardData = await dashboardService.loadDashboard();
      setUser(dashboardData.user);
      setPets(dashboardData.pets);
      setServices(dashboardData.services);
      setProfessionals(dashboardData.professionals);
      setCustomers(dashboardData.customers);
      setSchedules(dashboardData.schedules);
      setProfileForm(presentProfileForm(dashboardData.profile));
    } catch (requestError) {
      if (isUnauthorizedError(requestError)) {
        logout();
        return;
      }

      setError("Não foi possível carregar o painel");
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadData().catch(() => {
        setLoading(false);
        setError("Não foi possível carregar o painel");
      });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadData]);

  async function submit(action: () => Promise<void>, success: string) {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await action();
      setMessage(success);
      await loadData();
    } catch (requestError) {
      if (isUnauthorizedError(requestError)) {
        logout();
        return;
      }
      setError(presentRequestError(requestError));
    } finally {
      setSaving(false);
    }
  }

  function startEditService(service: Service) {
    setEditingServiceId(service._id);
    setServiceForm({
      name: service.name,
      descricao: service.descricao ?? "",
      duracao_min: String(service.duracao_min),
      preco: String(service.preco),
    });
    setServiceEditModalOpen(true);
    setActiveTab("servicos");
  }

  function startEditProfessional(professional: Professional) {
    setEditingProfessionalId(professional._id);
    setProfessionalForm({
      name: professional.name,
      email: professional.email,
      senha: "",
      telefone: professional.telefone ?? "",
      foto: professional.foto ?? "",
      especialidade: professional.especialidade,
      dias_trabalho: professional.dias_trabalho ?? [1, 2, 3, 4, 5],
      horario_inicio: professional.horario_inicio ?? "08:00",
      horario_fim: professional.horario_fim ?? "18:00",
      almoco_inicio: professional.almoco_inicio ?? "12:00",
      almoco_fim: professional.almoco_fim ?? "13:00",
    });
    setProfessionalEditModalOpen(true);
    setActiveTab("profissionais");
  }

  function openNewScheduleModal() {
    setEditingScheduleId(null);
    setScheduleForm({ animal: "", servico: "", profissional: "", data_hora: "" });
    setScheduleModalOpen(true);
  }

  function closePetEditModal() {
    setPetEditModalOpen(false);
    setEditingPetId(null);
    setPetForm(emptyPetForm());
  }

  function closeServiceEditModal() {
    setServiceEditModalOpen(false);
    setEditingServiceId(null);
    setServiceForm(emptyServiceForm());
  }

  function closeProfessionalEditModal() {
    setProfessionalEditModalOpen(false);
    setEditingProfessionalId(null);
    setProfessionalForm(emptyProfessionalForm());
  }

  function closeClientEditModal() {
    setClientEditModalOpen(false);
    setEditingClientId(null);
    setClientForm(emptyClientForm());
  }

  function closeConfirmModal() {
    setConfirmModal(null);
  }

  function openDeleteConfirm(options: ConfirmModalState) {
    setConfirmModal(options);
  }

  function startEditSchedule(schedule: Schedule) {
    setEditingScheduleId(schedule._id);
    setScheduleForm({
      animal: schedule.animal?._id ?? "",
      servico: schedule.servico?._id ?? "",
      profissional: schedule.profissional?._id ?? "",
      data_hora: schedule.data_hora ? schedule.data_hora.slice(0, 16) : "",
    });
    setActiveTab("agenda");
    setScheduleModalOpen(true);
  }

  function closeScheduleModal() {
    setScheduleModalOpen(false);
    setEditingScheduleId(null);
  }

  function startEditClient(customer: Customer) {
    setEditingClientId(customer._id);
    setClientForm({
      name: customer.name,
      email: customer.email,
      senha: "",
      telefone: customer.telefone ?? "",
      foto: customer.foto ?? "",
    });
    setClientEditModalOpen(true);
    setActiveTab("clientes");
  }

  function startEditPet(pet: Pet) {
    setEditingPetId(pet._id);
    setPetForm({
      nome: pet.nome,
      raca: pet.raca,
      idade: String(pet.idade),
      porte: pet.porte,
      foto: pet.foto ?? "",
      cliente: pet.cliente?._id ?? "",
    });
    setPetEditModalOpen(true);
    setActiveTab("pets");
  }

  async function handlePetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(
      async () => {
        const payload = {
          ...petForm,
          idade: Number(petForm.idade),
          cliente: isAdmin ? petForm.cliente : undefined,
        };
        await dashboardService.savePet(payload, editingPetId);
        setPetForm(emptyPetForm());
        setEditingPetId(null);
        setPetEditModalOpen(false);
      },
      editingPetId ? "Pet atualizado com sucesso" : "Pet salvo com sucesso",
    );
  }

  async function handleScheduleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(
      async () => {
        await dashboardService.saveSchedule(scheduleForm, editingScheduleId);
        setScheduleForm({ animal: "", servico: "", profissional: "", data_hora: "" });
        setEditingScheduleId(null);
        setScheduleModalOpen(false);
      },
      editingScheduleId
        ? "Agendamento atualizado com sucesso"
        : "Agendamento realizado com sucesso",
    );
  }

  async function handleServiceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(
      async () => {
        const payload = {
          ...serviceForm,
          duracao_min: Number(serviceForm.duracao_min),
          preco: Number(serviceForm.preco),
        };
        await dashboardService.saveService(payload, editingServiceId);
        setServiceForm(emptyServiceForm());
        setEditingServiceId(null);
        setServiceEditModalOpen(false);
      },
      editingServiceId ? "Serviço atualizado com sucesso" : "Serviço cadastrado com sucesso",
    );
  }

  async function handleProfessionalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateWorkSchedule(professionalForm);
    if (validationError) {
      setError(validationError);
      return;
    }
    await submit(
      async () => {
        const payload = { ...professionalForm, senha: professionalForm.senha || undefined };
        await dashboardService.saveProfessional(payload, editingProfessionalId);
        setProfessionalForm(emptyProfessionalForm());
        setEditingProfessionalId(null);
        setProfessionalEditModalOpen(false);
      },
      editingProfessionalId
        ? "Profissional atualizado com sucesso"
        : "Profissional cadastrado com sucesso",
    );
  }

  async function handleClientSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(
      async () => {
        const payload = { ...clientForm, senha: clientForm.senha || undefined };
        await dashboardService.saveCustomer(payload, editingClientId);
        setClientForm(emptyClientForm());
        setEditingClientId(null);
        setClientEditModalOpen(false);
      },
      editingClientId ? "Cliente atualizado com sucesso" : "Cliente cadastrado com sucesso",
    );
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isProfessional) {
      const validationError = validateWorkSchedule(profileForm);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    await submit(async () => {
      await dashboardService.updateProfile(user?.role ?? "cliente", profileForm);
      await auth.refreshUser();
    }, "Perfil atualizado com sucesso");
  }

  async function removeResource(path: string, success: string) {
    await submit(async () => {
      await dashboardService.removeResource(path);
    }, success);
  }

  async function cancelSchedule(id: string) {
    await submit(async () => {
      await dashboardService.cancelSchedule(id);
    }, "Agendamento cancelado");
  }

  async function confirmDestructiveAction() {
    if (!confirmModal) return;

    const action = confirmModal.onConfirm;
    setConfirmModal(null);
    await action();
  }

  return (
    <SiteShell>
      <SiteHeader
        rightAction={
          <>
            <HeaderUserSummary user={user} label={dashboardMode.label} />
            <button
              className="rounded-2xl bg-orange-500 px-4 py-3 font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              onClick={logout}
            >
              Sair
            </button>
          </>
        }
      />

      <main>
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
          <DashboardHeader user={user} mode={dashboardMode} />

          <div className="grid gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
            <DashboardFeedback
              message={message}
              error={error}
              loading={loading}
              onRetry={user ? undefined : () => void loadData()}
            />

            {!loading && user && (
              <>
                <DashboardMetrics
                  schedules={schedules.length}
                  services={services.length}
                  professionals={professionals.length}
                />
                <DashboardNavigation
                  tabs={availableTabs}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
                {activeTab === "servicos" && (isAdmin || isCustomer) && (
                  <section
                    className={`grid gap-6 ${isAdmin ? "xl:grid-cols-[minmax(320px,420px)_1fr]" : ""}`}
                  >
                    {isAdmin && (
                      <Card
                        icon="services"
                        title={editingServiceId ? "Editar serviço" : "Novo serviço"}
                        description="Descrição, duração e preço aparecem para o cliente e na LP."
                      >
                        <form className="grid gap-4" onSubmit={handleServiceSubmit}>
                          <Field label="Nome do serviço *">
                            <input
                              className={inputClass}
                              placeholder="Ex.: Banho completo"
                              value={serviceForm.name}
                              onChange={(event) =>
                                setServiceForm({ ...serviceForm, name: event.target.value })
                              }
                              required
                            />
                          </Field>
                          <Field label="Descrição *">
                            <textarea
                              className={`${inputClass} min-h-28 resize-y`}
                              value={serviceForm.descricao}
                              onChange={(event) =>
                                setServiceForm({ ...serviceForm, descricao: event.target.value })
                              }
                              required
                            />
                          </Field>
                          <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Duração *">
                              <input
                                className={inputClass}
                                min="1"
                                type="number"
                                value={serviceForm.duracao_min}
                                onChange={(event) =>
                                  setServiceForm({
                                    ...serviceForm,
                                    duracao_min: event.target.value,
                                  })
                                }
                                required
                              />
                            </Field>
                            <Field label="Preço *">
                              <input
                                className={inputClass}
                                min="0"
                                step="0.01"
                                type="number"
                                value={serviceForm.preco}
                                onChange={(event) =>
                                  setServiceForm({ ...serviceForm, preco: event.target.value })
                                }
                                required
                              />
                            </Field>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button className={buttonClass} disabled={saving}>
                              {editingServiceId ? "Salvar alterações" : "Cadastrar serviço"}
                            </button>
                            {editingServiceId && (
                              <button
                                className={secondaryButtonClass}
                                type="button"
                                onClick={() => {
                                  setEditingServiceId(null);
                                  setServiceForm(emptyServiceForm());
                                }}
                              >
                                Cancelar edição
                              </button>
                            )}
                          </div>
                        </form>
                      </Card>
                    )}

                    <Card
                      icon="list"
                      title={isAdmin ? "Serviços cadastrados" : "Serviços disponíveis"}
                      description={
                        isAdmin
                          ? "Gerencie serviços do catálogo do banho e tosa."
                          : "Consulte duração, valores e detalhes antes de agendar."
                      }
                    >
                      <div className="grid gap-3">
                        {services.map((service) => (
                          <article
                            className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
                            key={service._id}
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="text-lg font-black text-slate-950">
                                  {service.name}
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                  {service.descricao ?? "Sem descrição."}
                                </p>
                                <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                  {service.duracao_min} min • {formatCurrency(service.preco)}
                                </p>
                              </div>
                              {isAdmin && (
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    className={secondaryButtonClass}
                                    onClick={() => startEditService(service)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    className={dangerButtonClass}
                                    onClick={() =>
                                      openDeleteConfirm({
                                        title: "Excluir serviço?",
                                        description: `Você realmente deseja excluir o serviço ${service.name}? Esta ação não pode ser desfeita.`,
                                        confirmLabel: "Excluir serviço",
                                        tone: "danger",
                                        onConfirm: () =>
                                          removeResource(
                                            `/servicos/${service._id}`,
                                            "Serviço removido",
                                          ),
                                      })
                                    }
                                    disabled={saving}
                                  >
                                    Excluir
                                  </button>
                                </div>
                              )}
                            </div>
                          </article>
                        ))}
                        {services.length === 0 && (
                          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                            Nenhum serviço cadastrado.
                          </p>
                        )}
                      </div>
                    </Card>
                  </section>
                )}

                {activeTab === "profissionais" && (isAdmin || isCustomer) && (
                  <section
                    className={`grid gap-6 ${isAdmin ? "xl:grid-cols-[minmax(320px,420px)_1fr]" : ""}`}
                  >
                    {isAdmin && (
                      <Card
                        icon="users"
                        title={editingProfessionalId ? "Editar profissional" : "Novo profissional"}
                        description="Gerencie acesso, especialidade e disponibilidade da equipe."
                      >
                        <form className="grid gap-4" onSubmit={handleProfessionalSubmit}>
                          <Field label="Nome *">
                            <input
                              className={inputClass}
                              value={professionalForm.name}
                              onChange={(event) =>
                                setProfessionalForm({
                                  ...professionalForm,
                                  name: event.target.value,
                                })
                              }
                              required
                            />
                          </Field>
                          <Field label="E-mail *">
                            <input
                              className={inputClass}
                              type="email"
                              value={professionalForm.email}
                              onChange={(event) =>
                                setProfessionalForm({
                                  ...professionalForm,
                                  email: event.target.value,
                                })
                              }
                              required
                            />
                          </Field>
                          <Field
                            label={editingProfessionalId ? "Nova senha" : "Senha inicial *"}
                            hint={
                              editingProfessionalId
                                ? "Deixe em branco para manter a senha atual."
                                : "Mínimo de 6 caracteres."
                            }
                          >
                            <PasswordInput
                              className={inputClass}
                              minLength={6}
                              value={professionalForm.senha}
                              onChange={(event) =>
                                setProfessionalForm({
                                  ...professionalForm,
                                  senha: event.target.value,
                                })
                              }
                              required={!editingProfessionalId}
                            />
                          </Field>
                          <Field label="Telefone">
                            <input
                              className={inputClass}
                              type="tel"
                              value={professionalForm.telefone}
                              onChange={(event) =>
                                setProfessionalForm({
                                  ...professionalForm,
                                  telefone: event.target.value,
                                })
                              }
                            />
                          </Field>
                          <Field label="Especialidade *">
                            <input
                              className={inputClass}
                              value={professionalForm.especialidade}
                              onChange={(event) =>
                                setProfessionalForm({
                                  ...professionalForm,
                                  especialidade: event.target.value,
                                })
                              }
                              required
                            />
                          </Field>
                          <div className="grid gap-4">
                            <div className="grid gap-2 text-sm font-bold text-slate-700">
                              <span>Dias de trabalho *</span>
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                                {weekdayOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={professionalForm.dias_trabalho.includes(
                                      option.value,
                                    )}
                                    className={`rounded-2xl border px-3 py-2 text-sm font-bold transition ${professionalForm.dias_trabalho.includes(option.value) ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700"}`}
                                    onClick={() =>
                                      setProfessionalForm({
                                        ...professionalForm,
                                        dias_trabalho: professionalForm.dias_trabalho.includes(
                                          option.value,
                                        )
                                          ? professionalForm.dias_trabalho.filter(
                                              (item) => item !== option.value,
                                            )
                                          : [...professionalForm.dias_trabalho, option.value],
                                      })
                                    }
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <Field label="Hora inicial *">
                                <input
                                  className={inputClass}
                                  type="time"
                                  value={professionalForm.horario_inicio}
                                  onChange={(event) =>
                                    setProfessionalForm({
                                      ...professionalForm,
                                      horario_inicio: event.target.value,
                                    })
                                  }
                                  required
                                />
                              </Field>
                              <Field label="Hora final *">
                                <input
                                  className={inputClass}
                                  type="time"
                                  value={professionalForm.horario_fim}
                                  onChange={(event) =>
                                    setProfessionalForm({
                                      ...professionalForm,
                                      horario_fim: event.target.value,
                                    })
                                  }
                                  required
                                />
                              </Field>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <Field label="Saída para almoço">
                                <input
                                  className={inputClass}
                                  type="time"
                                  value={professionalForm.almoco_inicio}
                                  onChange={(event) =>
                                    setProfessionalForm({
                                      ...professionalForm,
                                      almoco_inicio: event.target.value,
                                    })
                                  }
                                />
                              </Field>
                              <Field label="Retorno do almoço">
                                <input
                                  className={inputClass}
                                  type="time"
                                  value={professionalForm.almoco_fim}
                                  onChange={(event) =>
                                    setProfessionalForm({
                                      ...professionalForm,
                                      almoco_fim: event.target.value,
                                    })
                                  }
                                />
                              </Field>
                            </div>
                          </div>
                          <Field label="Foto">
                            <input
                              className={inputClass}
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                void readImage(
                                  event,
                                  (foto) => setProfessionalForm({ ...professionalForm, foto }),
                                  setError,
                                )
                              }
                            />
                          </Field>
                          <PhotoPreview src={professionalForm.foto} alt="Prévia do profissional" />
                          <div className="flex flex-wrap gap-2">
                            <button className={buttonClass} disabled={saving}>
                              {editingProfessionalId ? "Salvar alterações" : "Criar profissional"}
                            </button>
                            {editingProfessionalId && (
                              <button
                                className={secondaryButtonClass}
                                type="button"
                                onClick={() => {
                                  setEditingProfessionalId(null);
                                  setProfessionalForm(emptyProfessionalForm());
                                }}
                              >
                                Cancelar edição
                              </button>
                            )}
                          </div>
                        </form>
                      </Card>
                    )}

                    <Card
                      icon="users"
                      title="Equipe profissional"
                      description={
                        isAdmin
                          ? "Gerencie os profissionais do banho e tosa."
                          : "Conheça os profissionais disponíveis para o atendimento."
                      }
                    >
                      <div className="grid gap-3">
                        {professionals.map((professional) => (
                          <article
                            className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                            key={professional._id}
                          >
                            <div className="flex gap-3">
                              {professional.foto ? (
                                <img
                                  className="h-14 w-14 rounded-2xl object-cover"
                                  src={professional.foto}
                                  alt={professional.name}
                                />
                              ) : (
                                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-blue-700">
                                  <Icon name="user" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-black text-slate-950">{professional.name}</h3>
                                <p className="text-sm text-slate-600">
                                  {professional.especialidade}
                                </p>
                                <p className="text-xs font-semibold text-slate-500">
                                  {professional.email}
                                </p>
                              </div>
                            </div>
                            {isAdmin && (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  className={secondaryButtonClass}
                                  onClick={() => startEditProfessional(professional)}
                                >
                                  Editar
                                </button>
                                <button
                                  className={dangerButtonClass}
                                  onClick={() =>
                                    openDeleteConfirm({
                                      title: "Excluir profissional?",
                                      description: `Você realmente deseja excluir o profissional ${professional.name}? Esta ação não pode ser desfeita.`,
                                      confirmLabel: "Excluir profissional",
                                      tone: "danger",
                                      onConfirm: () =>
                                        removeResource(
                                          `/profissionais/${professional._id}`,
                                          "Profissional removido",
                                        ),
                                    })
                                  }
                                  disabled={saving}
                                >
                                  Excluir
                                </button>
                              </div>
                            )}
                          </article>
                        ))}
                        {professionals.length === 0 && (
                          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                            Nenhum profissional cadastrado.
                          </p>
                        )}
                      </div>
                    </Card>
                  </section>
                )}

                {activeTab === "clientes" && isAdmin && (
                  <section className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
                    <Card
                      icon="clients"
                      title={editingClientId ? "Editar cliente" : "Novo cliente"}
                      description="Cadastre tutores e atualize seus dados de contato."
                    >
                      <form className="grid gap-4" onSubmit={handleClientSubmit}>
                        <Field label="Nome *">
                          <input
                            className={inputClass}
                            value={clientForm.name}
                            onChange={(event) =>
                              setClientForm({ ...clientForm, name: event.target.value })
                            }
                            required
                          />
                        </Field>
                        <Field label="E-mail *">
                          <input
                            className={inputClass}
                            type="email"
                            value={clientForm.email}
                            onChange={(event) =>
                              setClientForm({ ...clientForm, email: event.target.value })
                            }
                            required
                          />
                        </Field>
                        <Field
                          label={editingClientId ? "Nova senha" : "Senha inicial *"}
                          hint={editingClientId ? "Opcional na edição." : "Mínimo de 6 caracteres."}
                        >
                          <PasswordInput
                            className={inputClass}
                            minLength={6}
                            value={clientForm.senha}
                            onChange={(event) =>
                              setClientForm({ ...clientForm, senha: event.target.value })
                            }
                            required={!editingClientId}
                          />
                        </Field>
                        <Field label="Telefone">
                          <input
                            className={inputClass}
                            type="tel"
                            value={clientForm.telefone}
                            onChange={(event) =>
                              setClientForm({ ...clientForm, telefone: event.target.value })
                            }
                          />
                        </Field>
                        <Field label="Foto">
                          <input
                            className={inputClass}
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              void readImage(
                                event,
                                (foto) => setClientForm({ ...clientForm, foto }),
                                setError,
                              )
                            }
                          />
                        </Field>
                        <PhotoPreview src={clientForm.foto} alt="Prévia do cliente" />
                        <div className="flex flex-wrap gap-2">
                          <button className={buttonClass} disabled={saving}>
                            {editingClientId ? "Salvar alterações" : "Cadastrar cliente"}
                          </button>
                          {editingClientId && (
                            <button
                              className={secondaryButtonClass}
                              type="button"
                              onClick={() => {
                                setEditingClientId(null);
                                setClientForm(emptyClientForm());
                              }}
                            >
                              Cancelar edição
                            </button>
                          )}
                        </div>
                      </form>
                    </Card>

                    <Card
                      icon="list"
                      title="Clientes cadastrados"
                      description="Edite ou exclua tutores da base."
                    >
                      <div className="grid gap-3">
                        {customers.map((customer) => (
                          <article
                            className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                            key={customer._id}
                          >
                            <div className="flex gap-3">
                              {customer.foto ? (
                                <img
                                  className="h-14 w-14 rounded-2xl object-cover"
                                  src={customer.foto}
                                  alt={customer.name}
                                />
                              ) : (
                                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-blue-700">
                                  <Icon name="clients" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-black text-slate-950">{customer.name}</h3>
                                <p className="text-sm text-slate-600">{customer.email}</p>
                                <p className="text-xs font-semibold text-slate-500">
                                  {customer.telefone ?? "Sem telefone"}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                className={secondaryButtonClass}
                                onClick={() => startEditClient(customer)}
                              >
                                Editar
                              </button>
                              <button
                                className={dangerButtonClass}
                                onClick={() =>
                                  openDeleteConfirm({
                                    title: "Excluir cliente?",
                                    description: `Você realmente deseja excluir o cliente ${customer.name}? Esta ação não pode ser desfeita.`,
                                    confirmLabel: "Excluir cliente",
                                    tone: "danger",
                                    onConfirm: () =>
                                      removeResource(
                                        `/clientes/${customer._id}`,
                                        "Cliente removido",
                                      ),
                                  })
                                }
                                disabled={saving}
                              >
                                Excluir
                              </button>
                            </div>
                          </article>
                        ))}
                        {customers.length === 0 && (
                          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                            Nenhum cliente cadastrado.
                          </p>
                        )}
                      </div>
                    </Card>
                  </section>
                )}

                {activeTab === "pets" && (isAdmin || isCustomer) && (
                  <section className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
                    <Card
                      icon="pets"
                      title={editingPetId ? "Editar pet" : "Novo pet"}
                      description={
                        isAdmin
                          ? "Vincule o pet a um tutor."
                          : "Cadastre seu animal antes de agendar."
                      }
                    >
                      <form className="grid gap-4" onSubmit={handlePetSubmit}>
                        {isAdmin && (
                          <Field label="Tutor *">
                            <select
                              className={inputClass}
                              value={petForm.cliente}
                              onChange={(event) =>
                                setPetForm({ ...petForm, cliente: event.target.value })
                              }
                              required
                            >
                              <option value="">Selecione o cliente</option>
                              {customers.map((customer) => (
                                <option key={customer._id} value={customer._id}>
                                  {customer.name}
                                </option>
                              ))}
                            </select>
                          </Field>
                        )}
                        <Field label="Nome *">
                          <input
                            className={inputClass}
                            value={petForm.nome}
                            onChange={(event) =>
                              setPetForm({ ...petForm, nome: event.target.value })
                            }
                            required
                          />
                        </Field>
                        <Field label="Raça *">
                          <input
                            className={inputClass}
                            value={petForm.raca}
                            onChange={(event) =>
                              setPetForm({ ...petForm, raca: event.target.value })
                            }
                            required
                          />
                        </Field>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Idade *">
                            <input
                              className={inputClass}
                              min="0"
                              type="number"
                              value={petForm.idade}
                              onChange={(event) =>
                                setPetForm({ ...petForm, idade: event.target.value })
                              }
                              required
                            />
                          </Field>
                          <Field label="Porte *">
                            <select
                              className={inputClass}
                              value={petForm.porte}
                              onChange={(event) =>
                                setPetForm({ ...petForm, porte: event.target.value })
                              }
                            >
                              <option value="pequeno">Pequeno</option>
                              <option value="medio">Médio</option>
                              <option value="grande">Grande</option>
                            </select>
                          </Field>
                        </div>
                        <Field label="Foto">
                          <input
                            className={inputClass}
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              void readImage(
                                event,
                                (foto) => setPetForm({ ...petForm, foto }),
                                setError,
                              )
                            }
                          />
                        </Field>
                        <PhotoPreview src={petForm.foto} alt="Foto do pet" />
                        <div className="flex flex-wrap gap-2">
                          <button className={buttonClass} disabled={saving}>
                            {editingPetId ? "Salvar alterações" : "Cadastrar pet"}
                          </button>
                          {editingPetId && (
                            <button
                              className={secondaryButtonClass}
                              type="button"
                              onClick={() => {
                                setEditingPetId(null);
                                setPetForm(emptyPetForm());
                              }}
                            >
                              Cancelar edição
                            </button>
                          )}
                        </div>
                      </form>
                    </Card>

                    <Card
                      icon="pets"
                      title={isAdmin ? "Pets cadastrados" : "Meus pets"}
                      description={
                        isAdmin
                          ? "Gerencie todos os pets e seus tutores."
                          : "Cadastre, edite ou remova seus pets."
                      }
                    >
                      <div className="grid gap-3">
                        {pets.map((pet) => (
                          <article
                            className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                            key={pet._id}
                          >
                            <div className="flex gap-3">
                              {pet.foto ? (
                                <img
                                  className="h-14 w-14 rounded-2xl object-cover"
                                  src={pet.foto}
                                  alt={pet.nome}
                                />
                              ) : (
                                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-blue-700">
                                  <Icon name="pets" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-black text-slate-950">{pet.nome}</h3>
                                <p className="text-sm text-slate-600">
                                  {pet.raca} • {pet.idade} anos • {pet.porte}
                                </p>
                                {isAdmin && (
                                  <p className="text-xs font-semibold text-slate-500">
                                    Tutor: {pet.cliente?.name ?? "Não informado"}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                className={secondaryButtonClass}
                                onClick={() => startEditPet(pet)}
                              >
                                Editar
                              </button>
                              <button
                                className={dangerButtonClass}
                                onClick={() =>
                                  openDeleteConfirm({
                                    title: "Excluir pet?",
                                    description: `Você realmente deseja excluir o pet ${pet.nome}? Esta ação não pode ser desfeita.`,
                                    confirmLabel: "Excluir pet",
                                    tone: "danger",
                                    onConfirm: () =>
                                      removeResource(`/pets/${pet._id}`, "Pet removido"),
                                  })
                                }
                                disabled={saving}
                              >
                                Excluir
                              </button>
                            </div>
                          </article>
                        ))}
                        {pets.length === 0 && (
                          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                            Nenhum pet cadastrado.
                          </p>
                        )}
                      </div>
                    </Card>
                  </section>
                )}

                {activeTab === "perfil" && (isCustomer || isProfessional) && (
                  <section>
                    <Card
                      icon="settings"
                      title="Meu perfil"
                      description="Mantenha seus dados atualizados para facilitar contato e identificação."
                    >
                      <form className="grid gap-4" onSubmit={handleProfileSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Nome *">
                            <input
                              className={inputClass}
                              value={profileForm.name}
                              onChange={(event) =>
                                setProfileForm({ ...profileForm, name: event.target.value })
                              }
                              required
                            />
                          </Field>
                          <Field label="E-mail *">
                            <input
                              className={inputClass}
                              type="email"
                              value={profileForm.email}
                              onChange={(event) =>
                                setProfileForm({ ...profileForm, email: event.target.value })
                              }
                              required
                            />
                          </Field>
                          <Field label="Telefone">
                            <input
                              className={inputClass}
                              type="tel"
                              value={profileForm.telefone}
                              onChange={(event) =>
                                setProfileForm({ ...profileForm, telefone: event.target.value })
                              }
                            />
                          </Field>
                          <Field label="Foto">
                            <input
                              className={inputClass}
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                void readImage(
                                  event,
                                  (foto) => setProfileForm({ ...profileForm, foto }),
                                  setError,
                                )
                              }
                            />
                          </Field>
                          {isProfessional && (
                            <Field label="Especialidade *">
                              <input
                                className={inputClass}
                                value={profileForm.especialidade}
                                onChange={(event) =>
                                  setProfileForm({
                                    ...profileForm,
                                    especialidade: event.target.value,
                                  })
                                }
                                required
                              />
                            </Field>
                          )}
                          {isProfessional && (
                            <div className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">
                              <span>Dias de trabalho *</span>
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                                {weekdayOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={profileForm.dias_trabalho.includes(option.value)}
                                    className={`rounded-2xl border px-3 py-2 text-sm font-bold transition ${profileForm.dias_trabalho.includes(option.value) ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700"}`}
                                    onClick={() =>
                                      setProfileForm({
                                        ...profileForm,
                                        dias_trabalho: profileForm.dias_trabalho.includes(
                                          option.value,
                                        )
                                          ? profileForm.dias_trabalho.filter(
                                              (item) => item !== option.value,
                                            )
                                          : [...profileForm.dias_trabalho, option.value],
                                      })
                                    }
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {isProfessional && (
                            <Field label="Hora inicial *">
                              <input
                                className={inputClass}
                                type="time"
                                value={profileForm.horario_inicio}
                                onChange={(event) =>
                                  setProfileForm({
                                    ...profileForm,
                                    horario_inicio: event.target.value,
                                  })
                                }
                                required
                              />
                            </Field>
                          )}
                          {isProfessional && (
                            <Field label="Hora final *">
                              <input
                                className={inputClass}
                                type="time"
                                value={profileForm.horario_fim}
                                onChange={(event) =>
                                  setProfileForm({
                                    ...profileForm,
                                    horario_fim: event.target.value,
                                  })
                                }
                                required
                              />
                            </Field>
                          )}
                          {isProfessional && (
                            <Field label="Saída para almoço">
                              <input
                                className={inputClass}
                                type="time"
                                value={profileForm.almoco_inicio}
                                onChange={(event) =>
                                  setProfileForm({
                                    ...profileForm,
                                    almoco_inicio: event.target.value,
                                  })
                                }
                              />
                            </Field>
                          )}
                          {isProfessional && (
                            <Field label="Retorno do almoço">
                              <input
                                className={inputClass}
                                type="time"
                                value={profileForm.almoco_fim}
                                onChange={(event) =>
                                  setProfileForm({
                                    ...profileForm,
                                    almoco_fim: event.target.value,
                                  })
                                }
                              />
                            </Field>
                          )}
                        </div>
                        <PhotoPreview src={profileForm.foto} alt="Foto do perfil" />
                        <button className={buttonClass} disabled={saving}>
                          Atualizar perfil
                        </button>
                      </form>
                    </Card>
                  </section>
                )}

                {activeTab === "agenda" && (
                  <section className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
                    {isCustomer && (
                      <Card
                        icon="calendar"
                        title="Novo agendamento"
                        description="Abra o modal para escolher pet, serviço, profissional e o horário livre."
                      >
                        <div className="grid gap-4">
                          <p className="rounded-2xl bg-blue-50 p-4 text-sm font-medium text-blue-900">
                            Preencha os campos no modal para visualizar o calendário. Isso evita uma
                            tela longa cheia de espaços vazios e deixa a agenda mais clara.
                          </p>
                          <button
                            className={buttonClass}
                            type="button"
                            onClick={openNewScheduleModal}
                            disabled={
                              pets.length === 0 ||
                              services.length === 0 ||
                              professionals.length === 0
                            }
                          >
                            Abrir calendário
                          </button>
                        </div>
                      </Card>
                    )}

                    <Card
                      icon="calendar"
                      title="Agendamentos"
                      description={
                        isAdmin
                          ? "Visão geral de todos os clientes."
                          : isProfessional
                            ? "Atendimentos atribuídos ao seu perfil."
                            : "Seus horários marcados."
                      }
                    >
                      <div className="mb-4 flex justify-end">
                        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                          {schedules.length} registro(s)
                        </span>
                      </div>
                      <div className="grid gap-3">
                        {schedules.map((schedule) => (
                          <article
                            className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
                            key={schedule._id}
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="font-black text-slate-950">
                                  {schedule.animal?.nome ?? "Pet"} •{" "}
                                  {schedule.servico?.name ?? "Serviço"}
                                </h3>
                                <p className="text-sm text-slate-600">
                                  Profissional: {schedule.profissional?.name ?? "Não informado"}
                                </p>
                                {isAdmin && (
                                  <p className="text-sm text-slate-600">
                                    Cliente: {schedule.cliente?.name ?? "Não informado"} (
                                    {schedule.cliente?.email ?? "sem e-mail"})
                                  </p>
                                )}
                                <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                  {new Date(schedule.data_hora).toLocaleString()} •{" "}
                                  {schedule.status}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {can(user?.role, "schedule:edit") &&
                                  schedule.status === "scheduled" && (
                                    <button
                                      className={secondaryButtonClass}
                                      type="button"
                                      onClick={() => startEditSchedule(schedule)}
                                      disabled={saving}
                                    >
                                      Editar
                                    </button>
                                  )}
                                {can(user?.role, "schedule:cancel") &&
                                  schedule.status === "scheduled" && (
                                    <button
                                      className={dangerButtonClass}
                                      type="button"
                                      onClick={() =>
                                        openDeleteConfirm({
                                          title: "Cancelar agendamento?",
                                          description:
                                            "Você realmente deseja cancelar este agendamento? Esta ação pode ser revertida apenas criando um novo horário.",
                                          confirmLabel: "Cancelar agendamento",
                                          tone: "warning",
                                          onConfirm: () => cancelSchedule(schedule._id),
                                        })
                                      }
                                      disabled={saving}
                                    >
                                      Cancelar
                                    </button>
                                  )}
                              </div>
                            </div>
                          </article>
                        ))}
                        {schedules.length === 0 && (
                          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                            Nenhum agendamento encontrado.
                          </p>
                        )}
                      </div>
                    </Card>
                  </section>
                )}

                <Modal
                  open={scheduleModalOpen}
                  title={editingScheduleId ? "Editar agendamento" : "Novo agendamento"}
                  description="Escolha profissional e serviço para carregar o calendário, depois selecione o horário disponível."
                  onClose={closeScheduleModal}
                >
                  <form className="grid gap-4" onSubmit={handleScheduleSubmit}>
                    <Field label="Pet *">
                      <select
                        className={inputClass}
                        value={scheduleForm.animal}
                        onChange={(event) =>
                          setScheduleForm({ ...scheduleForm, animal: event.target.value })
                        }
                        required
                      >
                        <option value="">Selecione o pet</option>
                        {pets.map((pet) => (
                          <option key={pet._id} value={pet._id}>
                            {pet.nome}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <AvailabilityCalendar
                      professionals={professionals}
                      services={services}
                      value={{
                        profissional: scheduleForm.profissional,
                        servico: scheduleForm.servico,
                        data_hora: scheduleForm.data_hora,
                      }}
                      onChange={(next) => setScheduleForm({ ...scheduleForm, ...next })}
                      disabled={saving}
                    />
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        className={buttonClass}
                        disabled={
                          saving ||
                          !scheduleForm.data_hora ||
                          pets.length === 0 ||
                          services.length === 0 ||
                          professionals.length === 0
                        }
                      >
                        {editingScheduleId ? "Salvar agendamento" : "Confirmar agendamento"}
                      </button>
                      <button
                        className={secondaryButtonClass}
                        type="button"
                        onClick={closeScheduleModal}
                      >
                        Fechar
                      </button>
                    </div>
                  </form>
                </Modal>

                <Modal
                  open={petEditModalOpen}
                  title={editingPetId ? "Editar pet" : "Novo pet"}
                  description={
                    isAdmin ? "Vincule o pet a um tutor." : "Cadastre seu animal antes de agendar."
                  }
                  onClose={closePetEditModal}
                >
                  <form className="grid gap-4" onSubmit={handlePetSubmit}>
                    {isAdmin && (
                      <Field label="Tutor *">
                        <select
                          className={inputClass}
                          value={petForm.cliente}
                          onChange={(event) =>
                            setPetForm({ ...petForm, cliente: event.target.value })
                          }
                          required
                        >
                          <option value="">Selecione o cliente</option>
                          {customers.map((customer) => (
                            <option key={customer._id} value={customer._id}>
                              {customer.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                    <Field label="Nome *">
                      <input
                        className={inputClass}
                        value={petForm.nome}
                        onChange={(event) => setPetForm({ ...petForm, nome: event.target.value })}
                        required
                      />
                    </Field>
                    <Field label="Raça *">
                      <input
                        className={inputClass}
                        value={petForm.raca}
                        onChange={(event) => setPetForm({ ...petForm, raca: event.target.value })}
                        required
                      />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Idade *">
                        <input
                          className={inputClass}
                          min="0"
                          type="number"
                          value={petForm.idade}
                          onChange={(event) =>
                            setPetForm({ ...petForm, idade: event.target.value })
                          }
                          required
                        />
                      </Field>
                      <Field label="Porte *">
                        <select
                          className={inputClass}
                          value={petForm.porte}
                          onChange={(event) =>
                            setPetForm({ ...petForm, porte: event.target.value })
                          }
                        >
                          <option value="pequeno">Pequeno</option>
                          <option value="medio">Médio</option>
                          <option value="grande">Grande</option>
                        </select>
                      </Field>
                    </div>
                    <Field label="Foto">
                      <input
                        className={inputClass}
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          void readImage(
                            event,
                            (foto) => setPetForm({ ...petForm, foto }),
                            setError,
                          )
                        }
                      />
                    </Field>
                    <PhotoPreview src={petForm.foto} alt="Foto do pet" />
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button className={buttonClass} disabled={saving}>
                        {editingPetId ? "Salvar alterações" : "Cadastrar pet"}
                      </button>
                      <button
                        className={secondaryButtonClass}
                        type="button"
                        onClick={closePetEditModal}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </Modal>

                <Modal
                  open={serviceEditModalOpen}
                  title={editingServiceId ? "Editar serviço" : "Novo serviço"}
                  description="Descrição, duração e preço aparecem para o cliente e na LP."
                  onClose={closeServiceEditModal}
                >
                  <form className="grid gap-4" onSubmit={handleServiceSubmit}>
                    <Field label="Nome do serviço *">
                      <input
                        className={inputClass}
                        placeholder="Ex.: Banho completo"
                        value={serviceForm.name}
                        onChange={(event) =>
                          setServiceForm({ ...serviceForm, name: event.target.value })
                        }
                        required
                      />
                    </Field>
                    <Field label="Descrição *">
                      <textarea
                        className={`${inputClass} min-h-28 resize-y`}
                        value={serviceForm.descricao}
                        onChange={(event) =>
                          setServiceForm({ ...serviceForm, descricao: event.target.value })
                        }
                        required
                      />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Duração *">
                        <input
                          className={inputClass}
                          min="1"
                          type="number"
                          value={serviceForm.duracao_min}
                          onChange={(event) =>
                            setServiceForm({ ...serviceForm, duracao_min: event.target.value })
                          }
                          required
                        />
                      </Field>
                      <Field label="Preço *">
                        <input
                          className={inputClass}
                          min="0"
                          step="0.01"
                          type="number"
                          value={serviceForm.preco}
                          onChange={(event) =>
                            setServiceForm({ ...serviceForm, preco: event.target.value })
                          }
                          required
                        />
                      </Field>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button className={buttonClass} disabled={saving}>
                        {editingServiceId ? "Salvar alterações" : "Cadastrar serviço"}
                      </button>
                      <button
                        className={secondaryButtonClass}
                        type="button"
                        onClick={closeServiceEditModal}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </Modal>

                <Modal
                  open={professionalEditModalOpen}
                  title={editingProfessionalId ? "Editar profissional" : "Novo profissional"}
                  description="Gerencie acesso, especialidade e disponibilidade da equipe."
                  onClose={closeProfessionalEditModal}
                >
                  <form className="grid gap-4" onSubmit={handleProfessionalSubmit}>
                    <Field label="Nome *">
                      <input
                        className={inputClass}
                        value={professionalForm.name}
                        onChange={(event) =>
                          setProfessionalForm({ ...professionalForm, name: event.target.value })
                        }
                        required
                      />
                    </Field>
                    <Field label="E-mail *">
                      <input
                        className={inputClass}
                        type="email"
                        value={professionalForm.email}
                        onChange={(event) =>
                          setProfessionalForm({ ...professionalForm, email: event.target.value })
                        }
                        required
                      />
                    </Field>
                    <Field
                      label={editingProfessionalId ? "Nova senha" : "Senha inicial *"}
                      hint={
                        editingProfessionalId
                          ? "Deixe em branco para manter a senha atual."
                          : "Mínimo de 6 caracteres."
                      }
                    >
                      <PasswordInput
                        className={inputClass}
                        minLength={6}
                        value={professionalForm.senha}
                        onChange={(event) =>
                          setProfessionalForm({ ...professionalForm, senha: event.target.value })
                        }
                        required={!editingProfessionalId}
                      />
                    </Field>
                    <Field label="Telefone">
                      <input
                        className={inputClass}
                        type="tel"
                        value={professionalForm.telefone}
                        onChange={(event) =>
                          setProfessionalForm({
                            ...professionalForm,
                            telefone: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Especialidade *">
                      <input
                        className={inputClass}
                        value={professionalForm.especialidade}
                        onChange={(event) =>
                          setProfessionalForm({
                            ...professionalForm,
                            especialidade: event.target.value,
                          })
                        }
                        required
                      />
                    </Field>
                    <div className="grid gap-4">
                      <div className="grid gap-2 text-sm font-bold text-slate-700">
                        <span>Dias de trabalho *</span>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                          {weekdayOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              aria-pressed={professionalForm.dias_trabalho.includes(option.value)}
                              className={`rounded-2xl border px-3 py-2 text-sm font-bold transition ${professionalForm.dias_trabalho.includes(option.value) ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700"}`}
                              onClick={() =>
                                setProfessionalForm({
                                  ...professionalForm,
                                  dias_trabalho: professionalForm.dias_trabalho.includes(
                                    option.value,
                                  )
                                    ? professionalForm.dias_trabalho.filter(
                                        (item) => item !== option.value,
                                      )
                                    : [...professionalForm.dias_trabalho, option.value],
                                })
                              }
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Hora inicial *">
                          <input
                            className={inputClass}
                            type="time"
                            value={professionalForm.horario_inicio}
                            onChange={(event) =>
                              setProfessionalForm({
                                ...professionalForm,
                                horario_inicio: event.target.value,
                              })
                            }
                            required
                          />
                        </Field>
                        <Field label="Hora final *">
                          <input
                            className={inputClass}
                            type="time"
                            value={professionalForm.horario_fim}
                            onChange={(event) =>
                              setProfessionalForm({
                                ...professionalForm,
                                horario_fim: event.target.value,
                              })
                            }
                            required
                          />
                        </Field>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Saída para almoço">
                          <input
                            className={inputClass}
                            type="time"
                            value={professionalForm.almoco_inicio}
                            onChange={(event) =>
                              setProfessionalForm({
                                ...professionalForm,
                                almoco_inicio: event.target.value,
                              })
                            }
                          />
                        </Field>
                        <Field label="Retorno do almoço">
                          <input
                            className={inputClass}
                            type="time"
                            value={professionalForm.almoco_fim}
                            onChange={(event) =>
                              setProfessionalForm({
                                ...professionalForm,
                                almoco_fim: event.target.value,
                              })
                            }
                          />
                        </Field>
                      </div>
                    </div>
                    <Field label="Foto">
                      <input
                        className={inputClass}
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          void readImage(
                            event,
                            (foto) => setProfessionalForm({ ...professionalForm, foto }),
                            setError,
                          )
                        }
                      />
                    </Field>
                    <PhotoPreview src={professionalForm.foto} alt="Prévia do profissional" />
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button className={buttonClass} disabled={saving}>
                        {editingProfessionalId ? "Salvar alterações" : "Criar profissional"}
                      </button>
                      <button
                        className={secondaryButtonClass}
                        type="button"
                        onClick={closeProfessionalEditModal}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </Modal>

                <Modal
                  open={clientEditModalOpen}
                  title={editingClientId ? "Editar cliente" : "Novo cliente"}
                  description="Cadastre tutores e atualize seus dados de contato."
                  onClose={closeClientEditModal}
                >
                  <form className="grid gap-4" onSubmit={handleClientSubmit}>
                    <Field label="Nome *">
                      <input
                        className={inputClass}
                        value={clientForm.name}
                        onChange={(event) =>
                          setClientForm({ ...clientForm, name: event.target.value })
                        }
                        required
                      />
                    </Field>
                    <Field label="E-mail *">
                      <input
                        className={inputClass}
                        type="email"
                        value={clientForm.email}
                        onChange={(event) =>
                          setClientForm({ ...clientForm, email: event.target.value })
                        }
                        required
                      />
                    </Field>
                    <Field
                      label={editingClientId ? "Nova senha" : "Senha inicial *"}
                      hint={editingClientId ? "Opcional na edição." : "Mínimo de 6 caracteres."}
                    >
                      <PasswordInput
                        className={inputClass}
                        minLength={6}
                        value={clientForm.senha}
                        onChange={(event) =>
                          setClientForm({ ...clientForm, senha: event.target.value })
                        }
                        required={!editingClientId}
                      />
                    </Field>
                    <Field label="Telefone">
                      <input
                        className={inputClass}
                        type="tel"
                        value={clientForm.telefone}
                        onChange={(event) =>
                          setClientForm({ ...clientForm, telefone: event.target.value })
                        }
                      />
                    </Field>
                    <Field label="Foto">
                      <input
                        className={inputClass}
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          void readImage(
                            event,
                            (foto) => setClientForm({ ...clientForm, foto }),
                            setError,
                          )
                        }
                      />
                    </Field>
                    <PhotoPreview src={clientForm.foto} alt="Prévia do cliente" />
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button className={buttonClass} disabled={saving}>
                        {editingClientId ? "Salvar alterações" : "Cadastrar cliente"}
                      </button>
                      <button
                        className={secondaryButtonClass}
                        type="button"
                        onClick={closeClientEditModal}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </Modal>

                <Modal
                  open={Boolean(confirmModal)}
                  title={confirmModal?.title ?? "Confirmar ação"}
                  description={confirmModal?.description ?? ""}
                  onClose={closeConfirmModal}
                >
                  <div className="grid gap-4">
                    <div
                      className={`rounded-[1.5rem] border p-4 ${confirmModal?.tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-red-200 bg-red-50 text-red-900"}`}
                    >
                      <p className="text-sm font-semibold">
                        Você realmente deseja prosseguir com esta exclusão? A ação será executada
                        imediatamente após a confirmação.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        className={
                          confirmModal?.tone === "warning"
                            ? "inline-flex items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-amber-600"
                            : dangerButtonClass
                        }
                        type="button"
                        onClick={() => void confirmDestructiveAction()}
                        disabled={saving}
                      >
                        {confirmModal?.confirmLabel ?? "Confirmar"}
                      </button>
                      <button
                        className={secondaryButtonClass}
                        type="button"
                        onClick={closeConfirmModal}
                        disabled={saving}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </Modal>
              </>
            )}
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
