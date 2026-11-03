import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../services/auth/useAuth";

import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { AdminDashboard } from "../components/dashboard/AdminDashboard";
import { SchedulePanel } from "../components/dashboard/SchedulePanel";
import { DogsPanel } from "../components/dashboard/DogsPanel";
import { ServicesPanel } from "../components/dashboard/ServicesPanel";
import { ProfessionalsPanel } from "../components/dashboard/ProfessionalsPanel";
import { ClientsPanel } from "../components/dashboard/ClientsPanel";
import { ProfilePanel } from "../components/dashboard/ProfilePanel";
import LoginPage from "../pages/LoginPage"; 

export function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />
        }
      >
        
        <Route 
          index 
          element={
            user?.role === "admin" 
              ? <Navigate to="resumo" replace /> 
              : <Navigate to="agenda" replace />
          } 
        />

        
        <Route path="resumo" element={<AdminDashboard />} />
        <Route path="agenda" element={<SchedulePanel />} />
        <Route path="pets" element={<DogsPanel />} />
        <Route path="servicos" element={<ServicesPanel />} />
        <Route path="profissionais" element={<ProfessionalsPanel />} />
        <Route path="clientes" element={<ClientsPanel />} />
        <Route path="perfil" element={<ProfilePanel />} />
      </Route>

      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
