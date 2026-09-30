import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { LandingPage } from "../pages/landing/LandingPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ChangePasswordPage } from "../pages/auth/ChangePasswordPage";
import { useAuth } from "../services/auth/useAuth";

function PasswordChangeGate() {
  const { status, user } = useAuth();

  if (status === "checking") return null;
  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route element={<PasswordChangeGate />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage mode="register" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/app/dashboard" element={<DashboardPage />} />
          <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
