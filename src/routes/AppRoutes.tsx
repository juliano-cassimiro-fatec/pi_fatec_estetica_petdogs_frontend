import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { LandingPage } from "../pages/landing/LandingPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { useAuth } from "../services/auth/useAuth";

const DashboardPage = lazy(() =>
  import("../pages/dashboard/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);

function ProtectedDashboard() {
  const { status } = useAuth();
  if (status === "checking")
    return (
      <main className="grid min-h-screen place-items-center" role="status">
        Verificando sessão...
      </main>
    );
  return status === "authenticated" ? (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center" role="status">
          Carregando painel...
        </main>
      }
    >
      <DashboardPage />
    </Suspense>
  ) : (
    <Navigate to="/login" replace />
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage mode="register" />} />
        <Route path="/app/dashboard" element={<ProtectedDashboard />} />
        <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
