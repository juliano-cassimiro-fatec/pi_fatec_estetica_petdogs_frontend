import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../services/auth/useAuth";
import { DashboardPage } from "../pages/dashboard/DashboardPage"; 
import { LoginPage } from "../pages/auth/LoginPage"; 
import { LegalPage } from "../pages/legal/LegalPage";

export function AppRoutes() {
  const { user, status } = useAuth();
  const isAuthenticated = status === "authenticated";

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-slate-500 font-medium">Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <Routes>
      
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />
        }
      />

      {/* Rotas legais adicionadas e configuradas com a prop "document" */}
      <Route path="/termos-de-uso" element={<LegalPage document="terms" />} />
      <Route path="/politica-de-privacidade" element={<LegalPage document="privacy" />} />
      
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}