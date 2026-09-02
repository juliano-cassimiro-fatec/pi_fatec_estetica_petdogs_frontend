import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AvailabilityCalendar } from "../../components/calendar/AvailabilityCalendar";
import { Modal } from "../../components/ui/Modal";
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* =====================================================
          HEADER / NAVEGAÇÃO
      ====================================================== */}
        {!loading && user && (
          <>
            <header className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Logo / título */}
                <div className="shrink-0">
                  <h1 className="text-2xl font-black tracking-tight text-slate-950">
                    Banho & Tosa
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">Olá, {user.name}</p>
                </div>

                {/* Navegação */}
                <nav className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-50 p-1">
                  {[
                    {
                      key: "agenda",
                      label: "Agenda",
                      icon: "calendar",
                      show: true,
                    },
                    {
                      key: "pets",
                      label: "Pets",
                      icon: "pets",
                      show: isAdmin || isCustomer,
                    },
                    {
                      key: "servicos",
                      label: "Serviços",
                      icon: "services",
                      show: isAdmin || isCustomer,
                    },
                    {
                      key: "profissionais",
                      label: "Profissionais",
                      icon: "users",
                      show: isAdmin || isCustomer,
                    },
                    {
                      key: "clientes",
                      label: "Clientes",
                      icon: "clients",
                      show: isAdmin,
                    },
                    {
                      key: "perfil",
                      label: "Perfil",
                      icon: "settings",
                      show: isCustomer || isProfessional,
                    },
                  ]
                    .filter((item) => item.show)
                    .map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setActiveTab(item.key as TabKey)}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                          activeTab === item.key
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-white hover:text-slate-950"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                </nav>

                {/* Sair */}
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Sair
                </button>
              </div>
            </header>

            {/* =====================================================
              CONTEÚDO
          ====================================================== */}
            <div className="space-y-6">
              {/* =================================================
                AGENDA
            ================================================== */}
              {activeTab === "agenda" && (
                <section className="space-y-6">
                  {isCustomer && (
                    <Card
                      icon="calendar"
                      title="Novo agendamento"
                      description="Escolha seu pet, serviço, profissional e horário."
                    >
                      <button
                        className={buttonClass}
                        type="button"
                        onClick={openNewScheduleModal}
                        disabled={
                          pets.length === 0 || services.length === 0 || professionals.length === 0
                        }
                      >
                        <Icon name="calendar" />
                        Novo agendamento
                      </button>

                      {(pets.length === 0 ||
                        services.length === 0 ||
                        professionals.length === 0) && (
                        <p className="mt-3 text-xs font-medium text-slate-500">
                          Cadastre um pet e aguarde os serviços e profissionais disponíveis para
                          realizar um agendamento.
                        </p>
                      )}
                    </Card>
                  )}

                  <Card
                    icon="calendar"
                    title="Agendamentos"
                    description={
                      isAdmin
                        ? "Visualize todos os agendamentos."
                        : isProfessional
                          ? "Visualize seus atendimentos."
                          : "Visualize seus horários."
                    }
                  >
                    <div className="mb-5 flex justify-end">
                      <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                        {schedules.length} registro(s)
                      </span>
                    </div>

                    <div className="grid gap-3">
                      {schedules.map((schedule) => (
                        <article
                          key={schedule._id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-black text-slate-950">
                                  {schedule.animal?.nome ?? "Pet"}
                                </h3>

                                <span className="text-slate-300">•</span>

                                <span className="text-sm font-bold text-blue-600">
                                  {schedule.servico?.name ?? "Serviço"}
                                </span>
                              </div>

                              <p className="mt-1 text-sm text-slate-500">
                                Profissional: {schedule.profissional?.name ?? "Não informado"}
                              </p>

                              {isAdmin && (
                                <p className="text-sm text-slate-500">
                                  Cliente: {schedule.cliente?.name ?? "Não informado"}
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                  {new Date(schedule.data_hora).toLocaleString()}
                                </span>

                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                  {schedule.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {can(user.role, "schedule:edit") &&
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

                              {can(user.role, "schedule:cancel") &&
                                schedule.status === "scheduled" && (
                                  <button
                                    className={dangerButtonClass}
                                    type="button"
                                    onClick={() =>
                                      openDeleteConfirm({
                                        title: "Cancelar agendamento?",
                                        description: "O agendamento será cancelado.",
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
                        <div className="rounded-2xl bg-slate-50 px-6 py-10 text-center">
                          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm">
                            <Icon name="calendar" />
                          </div>

                          <p className="mt-3 font-bold text-slate-700">Nenhum agendamento</p>

                          <p className="mt-1 text-sm text-slate-500">
                            Os agendamentos aparecerão aqui.
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </section>
              )}

              {/* =================================================
                PETS
            ================================================== */}
              {activeTab === "pets" && (isAdmin || isCustomer) && (
                <section>
                  <Card
                    icon="pets"
                    title={isAdmin ? "Pets cadastrados" : "Meus pets"}
                    description={
                      isAdmin ? "Gerencie os animais cadastrados." : "Gerencie seus animais."
                    }
                  >
                    <div className="mb-5 flex justify-end">
                      <button
                        className={buttonClass}
                        type="button"
                        onClick={() => {
                          setEditingPetId(null);
                          setPetForm(emptyPetForm());
                          setPetEditModalOpen(true);
                        }}
                      >
                        <Icon name="pets" />
                        Novo pet
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {pets.map((pet) => (
                        <article
                          key={pet._id}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          {pet.foto ? (
                            <img
                              src={pet.foto}
                              alt={pet.nome}
                              className="h-40 w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-40 place-items-center bg-blue-50 text-blue-600">
                              <Icon name="pets" />
                            </div>
                          )}

                          <div className="p-4">
                            <h3 className="font-black text-slate-950">{pet.nome}</h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {pet.raca} · {pet.idade} anos
                            </p>

                            <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                              Porte: {pet.porte}
                            </span>

                            {isAdmin && (
                              <p className="mt-2 text-xs font-semibold text-slate-500">
                                Tutor: {pet.cliente?.name ?? "Não informado"}
                              </p>
                            )}

                            <div className="mt-4 flex gap-2">
                              <button
                                className={`${secondaryButtonClass} flex-1`}
                                type="button"
                                onClick={() => startEditPet(pet)}
                              >
                                Editar
                              </button>

                              <button
                                className={dangerButtonClass}
                                type="button"
                                onClick={() =>
                                  openDeleteConfirm({
                                    title: "Excluir pet?",
                                    description: `Você deseja excluir o pet ${pet.nome}?`,
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
                          </div>
                        </article>
                      ))}

                      {pets.length === 0 && (
                        <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
                          Nenhum pet cadastrado.
                        </p>
                      )}
                    </div>
                  </Card>
                </section>
              )}

              {/* =================================================
                SERVIÇOS
            ================================================== */}
              {activeTab === "servicos" && (isAdmin || isCustomer) && (
                <section>
                  <Card
                    icon="services"
                    title="Serviços"
                    description="Consulte os serviços disponíveis."
                  >
                    {isAdmin && (
                      <div className="mb-5 flex justify-end">
                        <button
                          className={buttonClass}
                          type="button"
                          onClick={() => {
                            setEditingServiceId(null);
                            setServiceForm(emptyServiceForm());
                            setServiceEditModalOpen(true);
                          }}
                        >
                          <Icon name="services" />
                          Novo serviço
                        </button>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {services.map((service) => (
                        <article
                          key={service._id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Icon name="services" />
                          </div>

                          <h3 className="mt-4 font-black text-slate-950">{service.name}</h3>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {service.descricao ?? "Sem descrição."}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-500">
                              {service.duracao_min} min
                            </span>

                            <strong className="text-lg font-black text-blue-600">
                              {formatCurrency(service.preco)}
                            </strong>
                          </div>

                          {isAdmin && (
                            <div className="mt-4 flex gap-2">
                              <button
                                className={`${secondaryButtonClass} flex-1`}
                                type="button"
                                onClick={() => startEditService(service)}
                              >
                                Editar
                              </button>

                              <button
                                className={dangerButtonClass}
                                type="button"
                                onClick={() =>
                                  openDeleteConfirm({
                                    title: "Excluir serviço?",
                                    description: `Você deseja excluir o serviço ${service.name}?`,
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
                        </article>
                      ))}

                      {services.length === 0 && (
                        <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
                          Nenhum serviço cadastrado.
                        </p>
                      )}
                    </div>
                  </Card>
                </section>
              )}

              {/* =================================================
                PROFISSIONAIS
            ================================================== */}
              {activeTab === "profissionais" && (isAdmin || isCustomer) && (
                <section>
                  <Card
                    icon="users"
                    title="Profissionais"
                    description="Conheça os profissionais disponíveis."
                  >
                    {isAdmin && (
                      <div className="mb-5 flex justify-end">
                        <button
                          className={buttonClass}
                          type="button"
                          onClick={() => {
                            setEditingProfessionalId(null);
                            setProfessionalForm(emptyProfessionalForm());
                            setProfessionalEditModalOpen(true);
                          }}
                        >
                          <Icon name="users" />
                          Novo profissional
                        </button>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {professionals.map((professional) => (
                        <article
                          key={professional._id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            {professional.foto ? (
                              <img
                                src={professional.foto}
                                alt={professional.name}
                                className="h-14 w-14 rounded-2xl object-cover"
                              />
                            ) : (
                              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                                <Icon name="user" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <h3 className="truncate font-black text-slate-950">
                                {professional.name}
                              </h3>

                              <p className="text-sm text-slate-500">{professional.especialidade}</p>
                            </div>
                          </div>

                          <p className="mt-4 truncate text-xs font-semibold text-slate-400">
                            {professional.email}
                          </p>

                          {isAdmin && (
                            <div className="mt-4 flex gap-2">
                              <button
                                className={`${secondaryButtonClass} flex-1`}
                                type="button"
                                onClick={() => startEditProfessional(professional)}
                              >
                                Editar
                              </button>

                              <button
                                className={dangerButtonClass}
                                type="button"
                                onClick={() =>
                                  openDeleteConfirm({
                                    title: "Excluir profissional?",
                                    description: `Você deseja excluir o profissional ${professional.name}?`,
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
                        <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
                          Nenhum profissional cadastrado.
                        </p>
                      )}
                    </div>
                  </Card>
                </section>
              )}

              {/* =================================================
                CLIENTES
            ================================================== */}
              {activeTab === "clientes" && isAdmin && (
                <section>
                  <Card
                    icon="clients"
                    title="Clientes"
                    description="Gerencie os tutores cadastrados."
                  >
                    <div className="mb-5 flex justify-end">
                      <button
                        className={buttonClass}
                        type="button"
                        onClick={() => {
                          setEditingClientId(null);
                          setClientForm(emptyClientForm());
                          setClientEditModalOpen(true);
                        }}
                      >
                        <Icon name="clients" />
                        Novo cliente
                      </button>
                    </div>

                    <div className="grid gap-3">
                      {customers.map((customer) => (
                        <article
                          key={customer._id}
                          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {customer.foto ? (
                              <img
                                src={customer.foto}
                                alt={customer.name}
                                className="h-12 w-12 shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                                <Icon name="clients" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <h3 className="truncate font-black text-slate-950">
                                {customer.name}
                              </h3>

                              <p className="truncate text-sm text-slate-500">{customer.email}</p>

                              <p className="text-xs text-slate-400">
                                {customer.telefone ?? "Sem telefone"}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              className={secondaryButtonClass}
                              type="button"
                              onClick={() => startEditClient(customer)}
                            >
                              Editar
                            </button>

                            <button
                              className={dangerButtonClass}
                              type="button"
                              onClick={() =>
                                openDeleteConfirm({
                                  title: "Excluir cliente?",
                                  description: `Você deseja excluir o cliente ${customer.name}?`,
                                  confirmLabel: "Excluir cliente",
                                  tone: "danger",
                                  onConfirm: () =>
                                    removeResource(`/clientes/${customer._id}`, "Cliente removido"),
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
                        <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                          Nenhum cliente cadastrado.
                        </p>
                      )}
                    </div>
                  </Card>
                </section>
              )}

              {/* =================================================
                PERFIL
            ================================================== */}
              {activeTab === "perfil" && (isCustomer || isProfessional) && (
                <section>
                  <Card
                    icon="settings"
                    title="Meu perfil"
                    description="Atualize seus dados pessoais."
                  >
                    <form className="grid gap-5" onSubmit={handleProfileSubmit}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Nome *">
                          <input
                            className={inputClass}
                            value={profileForm.name}
                            onChange={(event) =>
                              setProfileForm({
                                ...profileForm,
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
                            value={profileForm.email}
                            onChange={(event) =>
                              setProfileForm({
                                ...profileForm,
                                email: event.target.value,
                              })
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
                              setProfileForm({
                                ...profileForm,
                                telefone: event.target.value,
                              })
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
                                (foto) =>
                                  setProfileForm({
                                    ...profileForm,
                                    foto,
                                  }),
                                setError,
                              )
                            }
                          />
                        </Field>
                      </div>

                      <PhotoPreview src={profileForm.foto} alt="Foto do perfil" />

                      <div>
                        <button className={buttonClass} disabled={saving}>
                          Salvar alterações
                        </button>
                      </div>
                    </form>
                  </Card>
                </section>
              )}
            </div>

            {/* =====================================================
              MODAL - AGENDAMENTO
          ====================================================== */}
            <Modal
              open={scheduleModalOpen}
              title={editingScheduleId ? "Editar agendamento" : "Novo agendamento"}
              description="Escolha o pet, serviço, profissional e horário."
              onClose={closeScheduleModal}
            >
              <form className="grid gap-5" onSubmit={handleScheduleSubmit}>
                <Field label="Pet *">
                  <select
                    className={inputClass}
                    value={scheduleForm.animal}
                    onChange={(event) =>
                      setScheduleForm({
                        ...scheduleForm,
                        animal: event.target.value,
                      })
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
                  onChange={(next) =>
                    setScheduleForm({
                      ...scheduleForm,
                      ...next,
                    })
                  }
                  disabled={saving}
                />

                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={closeScheduleModal}
                    disabled={saving}
                  >
                    Fechar
                  </button>

                  <button
                    className={buttonClass}
                    disabled={saving || !scheduleForm.data_hora || !scheduleForm.animal}
                  >
                    {editingScheduleId ? "Salvar agendamento" : "Confirmar agendamento"}
                  </button>
                </div>
              </form>
            </Modal>

            {/* =====================================================
              MODAL - PET
          ====================================================== */}
            <Modal
              open={petEditModalOpen}
              title={editingPetId ? "Editar pet" : "Novo pet"}
              description={
                isAdmin ? "Cadastre o animal e vincule ao tutor." : "Cadastre seu animal."
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
                        setPetForm({
                          ...petForm,
                          cliente: event.target.value,
                        })
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
                      setPetForm({
                        ...petForm,
                        nome: event.target.value,
                      })
                    }
                    required
                  />
                </Field>

                <Field label="Raça *">
                  <input
                    className={inputClass}
                    value={petForm.raca}
                    onChange={(event) =>
                      setPetForm({
                        ...petForm,
                        raca: event.target.value,
                      })
                    }
                    required
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Idade *">
                    <input
                      className={inputClass}
                      min="0"
                      type="number"
                      value={petForm.idade}
                      onChange={(event) =>
                        setPetForm({
                          ...petForm,
                          idade: event.target.value,
                        })
                      }
                      required
                    />
                  </Field>

                  <Field label="Porte *">
                    <select
                      className={inputClass}
                      value={petForm.porte}
                      onChange={(event) =>
                        setPetForm({
                          ...petForm,
                          porte: event.target.value,
                        })
                      }
                      required
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
                        (foto) =>
                          setPetForm({
                            ...petForm,
                            foto,
                          }),
                        setError,
                      )
                    }
                  />
                </Field>

                <PhotoPreview src={petForm.foto} alt="Foto do pet" />

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={closePetEditModal}
                  >
                    Cancelar
                  </button>

                  <button className={buttonClass} disabled={saving}>
                    {editingPetId ? "Salvar alterações" : "Cadastrar pet"}
                  </button>
                </div>
              </form>
            </Modal>

            {/* =====================================================
              MODAL - SERVIÇO
          ====================================================== */}
            <Modal
              open={serviceEditModalOpen}
              title={editingServiceId ? "Editar serviço" : "Novo serviço"}
              description="Informe nome, descrição, duração e preço."
              onClose={closeServiceEditModal}
            >
              <form className="grid gap-4" onSubmit={handleServiceSubmit}>
                <Field label="Nome do serviço *">
                  <input
                    className={inputClass}
                    placeholder="Ex.: Banho completo"
                    value={serviceForm.name}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        name: event.target.value,
                      })
                    }
                    required
                  />
                </Field>

                <Field label="Descrição *">
                  <textarea
                    className={`${inputClass} min-h-28 resize-none`}
                    value={serviceForm.descricao}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        descricao: event.target.value,
                      })
                    }
                    required
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Duração (min) *">
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
                        setServiceForm({
                          ...serviceForm,
                          preco: event.target.value,
                        })
                      }
                      required
                    />
                  </Field>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={closeServiceEditModal}
                  >
                    Cancelar
                  </button>

                  <button className={buttonClass} disabled={saving}>
                    {editingServiceId ? "Salvar alterações" : "Cadastrar serviço"}
                  </button>
                </div>
              </form>
            </Modal>

            {/* =====================================================
              MODAL - PROFISSIONAL
          ====================================================== */}
            <Modal
              open={professionalEditModalOpen}
              title={editingProfessionalId ? "Editar profissional" : "Novo profissional"}
              description="Gerencie os dados e horários do profissional."
              onClose={closeProfessionalEditModal}
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
                      ? "Deixe vazio para manter a senha."
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

                {/* Dias */}
                <div className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">Dias de trabalho *</span>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {weekdayOptions.map((option) => {
                      const selected = professionalForm.dias_trabalho.includes(option.value);

                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setProfessionalForm({
                              ...professionalForm,
                              dias_trabalho: selected
                                ? professionalForm.dias_trabalho.filter(
                                    (item) => item !== option.value,
                                  )
                                : [...professionalForm.dias_trabalho, option.value],
                            })
                          }
                          className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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

                <div className="grid gap-4 sm:grid-cols-2">
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

                <Field label="Foto">
                  <input
                    className={inputClass}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      void readImage(
                        event,
                        (foto) =>
                          setProfessionalForm({
                            ...professionalForm,
                            foto,
                          }),
                        setError,
                      )
                    }
                  />
                </Field>

                <PhotoPreview src={professionalForm.foto} alt="Prévia do profissional" />

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={closeProfessionalEditModal}
                  >
                    Cancelar
                  </button>

                  <button className={buttonClass} disabled={saving}>
                    {editingProfessionalId ? "Salvar alterações" : "Criar profissional"}
                  </button>
                </div>
              </form>
            </Modal>

            {/* =====================================================
              MODAL - CLIENTE
          ====================================================== */}
            <Modal
              open={clientEditModalOpen}
              title={editingClientId ? "Editar cliente" : "Novo cliente"}
              description="Cadastre os dados do tutor."
              onClose={closeClientEditModal}
            >
              <form className="grid gap-4" onSubmit={handleClientSubmit}>
                <Field label="Nome *">
                  <input
                    className={inputClass}
                    value={clientForm.name}
                    onChange={(event) =>
                      setClientForm({
                        ...clientForm,
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
                    value={clientForm.email}
                    onChange={(event) =>
                      setClientForm({
                        ...clientForm,
                        email: event.target.value,
                      })
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
                      setClientForm({
                        ...clientForm,
                        senha: event.target.value,
                      })
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
                      setClientForm({
                        ...clientForm,
                        telefone: event.target.value,
                      })
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
                        (foto) =>
                          setClientForm({
                            ...clientForm,
                            foto,
                          }),
                        setError,
                      )
                    }
                  />
                </Field>

                <PhotoPreview src={clientForm.foto} alt="Prévia do cliente" />

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={closeClientEditModal}
                  >
                    Cancelar
                  </button>

                  <button className={buttonClass} disabled={saving}>
                    {editingClientId ? "Salvar alterações" : "Cadastrar cliente"}
                  </button>
                </div>
              </form>
            </Modal>

            {/* =====================================================
              MODAL - CONFIRMAÇÃO
          ====================================================== */}
            <Modal
              open={Boolean(confirmModal)}
              title={confirmModal?.title ?? "Confirmar ação"}
              description={confirmModal?.description ?? ""}
              onClose={closeConfirmModal}
            >
              <div className="grid gap-5">
                <div
                  className={`rounded-2xl border p-4 ${
                    confirmModal?.tone === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : "border-red-200 bg-red-50 text-red-900"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    Essa ação não pode ser desfeita. Deseja realmente continuar?
                  </p>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={closeConfirmModal}
                    disabled={saving}
                  >
                    Voltar
                  </button>

                  <button
                    className={
                      confirmModal?.tone === "warning"
                        ? "inline-flex items-center justify-center rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
                        : dangerButtonClass
                    }
                    type="button"
                    onClick={() => void confirmDestructiveAction()}
                    disabled={saving}
                  >
                    {saving ? "Aguarde..." : (confirmModal?.confirmLabel ?? "Confirmar")}
                  </button>
                </div>
              </div>
            </Modal>
          </>
        )}
      </div>
    </main>
  );
}
