import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { authService } from "../services/auth/authService"

interface ProtectedRoutesProps {
  children: ReactNode
}

export function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  if (!authService.hasValidSession()) {
    return <Navigate to="/login" replace />
  }

  return children
}
