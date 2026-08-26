import { createContext } from "react"
import type {
  AuthUser,
  LoginCredentials,
  RegisterCustomerData,
} from "../../features/shared/types"

export type AuthStatus = "checking" | "authenticated" | "unauthenticated"

export interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  signIn(credentials: LoginCredentials): Promise<void>
  register(data: RegisterCustomerData): Promise<void>
  signOut(): void
  refreshUser(): Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
