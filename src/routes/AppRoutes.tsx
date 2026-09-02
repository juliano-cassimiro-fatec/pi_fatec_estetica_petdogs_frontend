import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { LandingPage } from "../pages/landing/LandingPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage mode="register" />} />
        <Route path="/app/dashboard" element={<DashboardPage />} />
        <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
