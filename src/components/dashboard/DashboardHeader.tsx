import PhotoPreview from "../ui/PhotoPreview";
import type { AuthUser } from "../../services/types";
import type { TabKey } from "./dashboardConfig";

interface DashboardHeaderProps {
  user: AuthUser;
  isAdmin: boolean;
  isProfessional: boolean;
  isCustomer: boolean;
  activeTab: TabKey;
  dogCount: number;
  onTabChange: (tab: TabKey) => void;
  onProfile: () => void;
  onLogout: () => void;
}

export function DashboardHeader({
  user,
  isAdmin,
  isProfessional,
  isCustomer,
  activeTab,
  dogCount,
  onTabChange,
  onProfile,
  onLogout,
}: DashboardHeaderProps) {
  const tabs: { key: TabKey; label: string; show: boolean }[] = [
    { key: "dashboard", label: "Visão geral", show: isAdmin },
    {
      key: "agenda",
      label: "Agenda",
      show: isAdmin || isProfessional || (isCustomer && dogCount > 0),
    },
    { key: "pets", label: "Cães", show: isAdmin || isCustomer },
    { key: "servicos", label: "Serviços", show: isAdmin || isCustomer },
    { key: "profissionais", label: "Profissionais", show: isAdmin || isCustomer },
    { key: "clientes", label: "Clientes", show: isAdmin },
  ];

  return (
    <header className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Banho &amp; Tosa</h1>
        </div>

        <nav className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-50 p-1">
          {tabs
            .filter((tab) => tab.show)
            .map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                {tab.label}
              </button>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <button
              onClick={onProfile}
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <PhotoPreview
                  src={user.foto}
                  alt="Foto do usuário"
                  className="h-8 w-8 rounded-full"
                />
              </span>
              <span className="hidden sm:block">Perfil</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
