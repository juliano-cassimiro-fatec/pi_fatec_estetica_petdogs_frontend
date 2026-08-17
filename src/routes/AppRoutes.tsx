import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { LoginPage } from "../pages/auth/LoginPage"
import { DashboardPage } from "../pages/dashboard/DashboardPage"
import { LandingPage } from "../pages/landing/LandingPage"
import { UnauthorizedPage } from "../pages/UnauthorizedPage"
import { authService } from "../services/auth/authService"

function ProtectedDashboard() {
  return authService.hasValidSession() ? <DashboardPage /> : <Navigate to="/login" replace />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
