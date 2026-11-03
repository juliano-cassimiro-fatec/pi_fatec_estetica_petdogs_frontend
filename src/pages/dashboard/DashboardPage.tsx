import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type {
  Customer,
  Pet,
  Professional,
  Schedule,
  Service,
} from "../../services/types";
import { dashboardService } from "../../services/dashboard/dashboardService";
import type { PetPayload } from "../../services/dashboard/types";
import { useAuth } from "../../services/auth/useAuth";
import { isUnauthorizedError, presentRequestError } from "../../services/api/errors";
import { emptyProfileForm, presentProfileForm } from "../../services/dashboard/profileForm";
import {
  emptyClientForm,
  emptyPetForm,
  emptyProfessionalForm,
  emptyServiceForm,
  onlyDigits,
  validateWorkSchedule,
  type ConfirmModalState,
  type ScheduleFormState,
  type TabKey,
} from "../../components/dashboard/dashboardConfig";
import { can } from "../../components/dashboard/permissions";
import { uploadImage } from "../../services/uploads/uploadService";
import { showToast } from "../../components/ui/toastEvents";

// Modais
import { ScheduleModal } from "../../components/dashboard/ScheduleModal";
import { PetModal } from "../../components/dashboard/PetModal";
import { ServiceModal } from "../../components/dashboard/ServiceModal";
import { ProfessionalModal } from "../../components/dashboard/ProfessionalModal";
import { ClientModal } from "../../components/dashboard/ClientModal";
import { ConfirmationModal } from "../../components/dashboard/ConfirmationModal";

// Painéis
import { SchedulePanel } from "../../components/dashboard/SchedulePanel";
import { DogsPanel } from "../../components/dashboard/DogsPanel";
import { ServicesPanel } from "../../components/dashboard/ServicesPanel";
import { ProfessionalsPanel } from "../../components/dashboard/ProfessionalsPanel";
import { ClientsPanel } from "../../components/dashboard/ClientsPanel";
import { ProfilePanel } from "../../components/dashboard/ProfilePanel";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { AdminDashboard } from "../../components/dashboard/AdminDashboard";

function getAgeFromBirthDate(value: string) {
  if (!value) return -1;
  const [year, month, day] = value.split("-").map(Number);
  const today = new Date();
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  return today.getFullYear() - year - (hasHadBirthdayThisYear ? 0 : 1);
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("agenda");
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  
  const [petForm, setPetForm] = useState(emptyPetForm());
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [petEditModalOpen, setPetEditModalOpen] = useState(false);
  
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>({
    cao: "",
    servico: "",
    profissional: "",
    data_hora: "",
  });
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleInitialDate, setScheduleInitialDate] = useState("");
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
    signOut();
    void navigate("/login", { replace: true });
  }, [signOut, navigate]);

  const loadData = useCallback(
    async (showLoading = true) => {
      if (!user) return;
      try {
        if (showLoading) setLoading(true);
        setError("");

        const [fetchedServices, fetchedProfessionals, fetchedSchedules] = await Promise.all([
          dashboardService.listServices(),
          dashboardService.listProfessionals(),
          dashboardService.listSchedules(),
        ]);

        const [fetchedPets, fetchedCustomers, customerProfile] = await Promise.all([
          user.role === "cliente" || user.role === "admin"
            ? dashboardService.listPets()
            : Promise.resolve([]),
          user.role === "admin" ? dashboardService.listCustomers() : Promise.resolve([]),
          user.role === "cliente"
            ? dashboardService.getCustomerProfile()
            : Promise.resolve<Customer | undefined>(undefined),
        ]);

        setServices(fetchedServices);
        setProfessionals(fetchedProfessionals);
        setSchedules(fetchedSchedules);
        setPets(fetchedPets);
        setCustomers(fetchedCustomers);

        if (user.role === "admin") setActiveTab("dashboard");
        if (user.role === "cliente" && fetchedPets.length === 0) {
          setActiveTab("pets");
          if (showLoading) {
            setPetForm(emptyPetForm());
            setEditingPetId(null);
            setPetEditModalOpen(true);
          }
        }

        const profileData =
          user.role === "profissional"
            ? fetchedProfessionals.find((item) => item._id === user.id)
            : customerProfile;

        setProfileForm(presentProfileForm(profileData));
      } catch (requestError) {
        if (isUnauthorizedError(requestError)) {
          logout();
          return;
        }
        setError("Não foi possível carregar os dados do painel.");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [user, logout],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    setPhoto: (value: string) => void,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      const uploadedImage = await uploadImage(file);
      setPhoto(uploadedImage.caminho);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : presentRequestError(uploadError);
      setError(message);
      showToast(message);
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  async function submit(action: () => Promise<void>, success: string) {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await action();
      setMessage(success);
      await loadData(false);
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
      dias_trabalho: professional.dias_trabalho,
      horario_inicio: professional.horario_inicio,
      horario_fim: professional.horario_fim,
      almoco_inicio: professional.almoco_inicio ?? "12:00",
      almoco_fim: professional.almoco_fim ?? "13:00",
    });
    setProfessionalEditModalOpen(true);
    setActiveTab("profissionais");
  }

  function openNewScheduleModal(initialDate?: string) {
    setEditingScheduleId(null);
    setScheduleInitialDate(initialDate ?? "");
    setScheduleForm({ cao: "", servico: "", profissional: "", data_hora: "" });
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

  function openExitConfirm(options: ConfirmModalState) {
    setConfirmModal(options);
  }

  function startEditSchedule(schedule: Schedule) {
    setEditingScheduleId(schedule._id);
    setScheduleInitialDate("");
    setScheduleForm({
      cao: schedule.cao?._id ?? schedule.animal?._id ?? "",
      servico: schedule.servico?._id ?? "",
      profissional: schedule.profissional?._id ?? "",
      data_hora: schedule.data_hora,
    });
    setActiveTab("agenda");
    setScheduleModalOpen(true);
  }

  function closeScheduleModal() {
    setScheduleModalOpen(false);
    setEditingScheduleId(null);
    setScheduleInitialDate("");
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
      dataNascimento: "",
      porte: pet.porte,
      foto: pet.foto ?? "",
      cliente: pet.cliente?._id ?? "",
    });
    setPetEditModalOpen(true);
    setActiveTab("pets");
  }

  async function handlePetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading) return;
    const idade = getAgeFromBirthDate(petForm.dataNascimento);
    if (idade < 0 || idade > 18) {
      const message = "Informe uma data de nascimento válida para um cão de até 18 anos.";
      setError(message);
      showToast(message);
      return;
    }

    await submit(
      async () => {
        const { dataNascimento, ...petData } = petForm;
        const payload: PetPayload = {
          ...petData,
          idade,
          cliente: isAdmin ? petForm.cliente : undefined,
        };
        const existingPet = pets.find((pet) => pet._id === editingPetId);
        const changedPayload: Partial<PetPayload> = {};

        if (existingPet) {
          if (existingPet.nome !== payload.nome) changedPayload.nome = payload.nome;
          if (existingPet.raca !== payload.raca) changedPayload.raca = payload.raca;
          if (existingPet.idade !== payload.idade) changedPayload.idade = payload.idade;
          if (existingPet.porte !== payload.porte) changedPayload.porte = payload.porte;
          if ((existingPet.foto ?? "") !== (payload.foto ?? "")) changedPayload.foto = payload.foto;
          if (isAdmin && existingPet.cliente?._id !== payload.cliente) {
            changedPayload.cliente = payload.cliente;
          }
        }

        await dashboardService.savePet(
          editingPetId && existingPet ? changedPayload : payload,
          editingPetId,
        );
        setPetForm(emptyPetForm());
        setEditingPetId(null);
        setPetEditModalOpen(false);
      },
      editingPetId ? "Cão atualizado com sucesso" : "Cão cadastrado com sucesso",
    );
  }

  async function handleScheduleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading) return;
    await submit(
      async () => {
        await dashboardService.saveSchedule(scheduleForm, editingScheduleId);
        setScheduleForm({ cao: "", servico: "", profissional: "", data_hora: "" });
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
    if (uploading) return;
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
    if (uploading) return;
    const validationError = validateWorkSchedule(professionalForm);
    if (validationError) {
      setError(validationError);
      showToast(validationError);
      return;
    }
    await submit(
      async () => {
        const payload = {
          ...professionalForm,
          telefone: onlyDigits(professionalForm.telefone),
          senha: professionalForm.senha || undefined,
        };
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
    if (uploading) return;
    await submit(
      async () => {
        const payload = {
          ...clientForm,
          telefone: onlyDigits(clientForm.telefone),
          senha: clientForm.senha || undefined,
        };
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
    if (uploading) return;
    if (isProfessional) {
      const validationError = validateWorkSchedule(profileForm);
      if (validationError) {
        setError(validationError);
        showToast(validationError);
        return;
      }
    }
    await submit(async () => {
      await dashboardService.updateProfile(user?.role ?? "cliente", {
        ...profileForm,
        telefone: onlyDigits(profileForm.telefone),
      });
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

  async function confirmSchedule(id: string) {
    await submit(async () => {
      await dashboardService.confirmSchedule(id);
    }, "Agendamento confirmado");
  }

  async function confirmDestructiveAction() {
    if (!confirmModal) return;
    const action = confirmModal.onConfirm;
    setConfirmModal(null);
    await action();
  }

  // Tratamento visual para estado de carregamento e erro (evita tela branca)
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-slate-500 font-medium">Carregando dados do painel...</p>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => void loadData()}
            className="mt-4 rounded bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
          >
            Tentar Novamente
          </button>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <DashboardHeader
          user={user}
          isAdmin={isAdmin}
          isProfessional={isProfessional}
          isCustomer={isCustomer}
          activeTab={activeTab}
          dogCount={pets.length}
          onTabChange={setActiveTab}
          onProfile={() => setActiveTab("perfil")}
          onLogout={() =>
            openExitConfirm({
              title: "Sair da aplicação?",
              description: "Você será desconectado da aplicação.",
              confirmLabel: "Sair",
              tone: "warning",
              onConfirm: () => Promise.resolve(logout()),
            })
          }
        />

        <div className="space-y-6">
          {activeTab === "dashboard" && isAdmin && (
            <AdminDashboard
              dogs={pets}
              schedules={schedules}
              customerCount={customers.length}
              saving={saving}
              canCreateSchedule={pets.length > 0 && services.length > 0 && professionals.length > 0}
              onOpenDogs={() => setActiveTab("pets")}
              onOpenSchedule={() => openNewScheduleModal()}
              onOpenCalendar={() => setActiveTab("agenda")}
              onEditSchedule={startEditSchedule}
              onConfirmSchedule={(schedule) => confirmSchedule(schedule._id)}
              onCancelSchedule={(schedule) =>
                openDeleteConfirm({
                  title: "Cancelar agendamento?",
                  description: `O atendimento de ${schedule.cao?.nome ?? schedule.animal?.nome ?? "Cão"} será cancelado.`,
                  confirmLabel: "Cancelar agendamento",
                  tone: "warning",
                  onConfirm: () => cancelSchedule(schedule._id),
                })
              }
            />
          )}

          {activeTab === "agenda" && (
            <SchedulePanel
              schedules={schedules}
              isAdmin={isAdmin}
              isProfessional={isProfessional}
              canEdit={can(user.role, "schedule:edit")}
              canConfirm={can(user.role, "schedule:confirm")}
              canCancel={can(user.role, "schedule:cancel")}
              canCreate={pets.length > 0 && services.length > 0 && professionals.length > 0}
              saving={saving}
              onCreate={openNewScheduleModal}
              onEdit={startEditSchedule}
              onConfirm={(schedule) => confirmSchedule(schedule._id)}
              onCancel={(schedule) =>
                openDeleteConfirm({
                  title: "Cancelar agendamento?",
                  description: `O atendimento de ${schedule.cao?.nome ?? schedule.animal?.nome ?? "Cão"} será cancelado.`,
                  confirmLabel: "Cancelar agendamento",
                  tone: "warning",
                  onConfirm: () => cancelSchedule(schedule._id),
                })
              }
            />
          )}

          {activeTab === "pets" && (isAdmin || isCustomer) && (
            <DogsPanel
              dogs={pets}
              isAdmin={isAdmin}
              saving={saving}
              onAdd={() => {
                setEditingPetId(null);
                setPetForm(emptyPetForm());
                setPetEditModalOpen(true);
              }}
              onEdit={startEditPet}
              onDelete={(pet) =>
                openDeleteConfirm({
                  title: "Excluir cão?",
                  description: `Você deseja excluir o cão ${pet.nome}?`,
                  confirmLabel: "Excluir cão",
                  tone: "danger",
                  onConfirm: () => removeResource(`/caes/${pet._id}`, "Cão removido"),
                })
              }
            />
          )}

          {activeTab === "servicos" && (isAdmin || isCustomer) && (
            <ServicesPanel
              services={services}
              isAdmin={isAdmin}
              saving={saving}
              onAdd={() => {
                setEditingServiceId(null);
                setServiceForm(emptyServiceForm());
                setServiceEditModalOpen(true);
              }}
              onEdit={startEditService}
              onDelete={(service) =>
                openDeleteConfirm({
                  title: "Excluir serviço?",
                  description: `Você deseja excluir o serviço ${service.name}?`,
                  confirmLabel: "Excluir serviço",
                  tone: "danger",
                  onConfirm: () =>
                    removeResource(`/servicos/${service._id}`, "Serviço removido"),
                })
              }
            />
          )}

          {activeTab === "profissionais" && (isAdmin || isCustomer) && (
            <ProfessionalsPanel
              professionals={professionals}
              isAdmin={isAdmin}
              saving={saving}
              onAdd={() => {
                setEditingProfessionalId(null);
                setProfessionalForm(emptyProfessionalForm());
                setProfessionalEditModalOpen(true);
              }}
              onEdit={startEditProfessional}
              onDelete={(professional) =>
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
            />
          )}

          {activeTab === "clientes" && isAdmin && (
            <ClientsPanel
              customers={customers}
              saving={saving}
              onAdd={() => {
                setEditingClientId(null);
                setClientForm(emptyClientForm());
                setClientEditModalOpen(true);
              }}
              onEdit={startEditClient}
              onDelete={(customer) =>
                openDeleteConfirm({
                  title: "Excluir cliente?",
                  description: `Você deseja excluir o cliente ${customer.name}?`,
                  confirmLabel: "Excluir cliente",
                  tone: "danger",
                  onConfirm: () =>
                    removeResource(`/clientes/${customer._id}`, "Cliente removido"),
                })
              }
            />
          )}

          {activeTab === "perfil" && (isCustomer || isProfessional) && (
            <ProfilePanel
              form={profileForm}
              uploading={uploading}
              saving={saving}
              onChange={setProfileForm}
              onSubmit={handleProfileSubmit}
              onImageChange={(event) =>
                void handleImageChange(event, (foto) =>
                  setProfileForm((current) => ({ ...current, foto })),
                )
              }
            />
          )}
        </div>

        <ScheduleModal
          open={scheduleModalOpen}
          editingScheduleId={editingScheduleId}
          form={scheduleForm}
          dogs={pets}
          professionals={professionals}
          services={services}
          initialDate={scheduleInitialDate}
          saving={saving}
          onClose={closeScheduleModal}
          onSubmit={handleScheduleSubmit}
          onChange={setScheduleForm}
        />

        <PetModal
          open={petEditModalOpen}
          isAdmin={isAdmin}
          editingPetId={editingPetId}
          form={petForm}
          customers={customers}
          uploading={uploading}
          saving={saving}
          onClose={closePetEditModal}
          onSubmit={handlePetSubmit}
          onChange={setPetForm}
          onImageChange={(event) =>
            void handleImageChange(event, (foto) =>
              setPetForm((current) => ({ ...current, foto })),
            )
          }
        />

        <ServiceModal
          open={serviceEditModalOpen}
          editingServiceId={editingServiceId}
          form={serviceForm}
          saving={saving}
          onClose={closeServiceEditModal}
          onSubmit={handleServiceSubmit}
          onChange={setServiceForm}
        />

        <ProfessionalModal
          open={professionalEditModalOpen}
          editingProfessionalId={editingProfessionalId}
          form={professionalForm}
          uploading={uploading}
          saving={saving}
          onClose={closeProfessionalEditModal}
          onSubmit={handleProfessionalSubmit}
          onChange={setProfessionalForm}
          onImageChange={(event) =>
            void handleImageChange(event, (foto) =>
              setProfessionalForm((current) => ({ ...current, foto })),
            )
          }
        />

        <ClientModal
          open={clientEditModalOpen}
          editingClientId={editingClientId}
          form={clientForm}
          uploading={uploading}
          saving={saving}
          onClose={closeClientEditModal}
          onSubmit={handleClientSubmit}
          onChange={setClientForm}
          onImageChange={(event) =>
            void handleImageChange(event, (foto) =>
              setClientForm((current) => ({ ...current, foto })),
            )
          }
        />

        <ConfirmationModal
          state={confirmModal}
          saving={saving}
          onClose={closeConfirmModal}
          onConfirm={() => void confirmDestructiveAction()}
        />
      </div>
    </main>
  );
}
