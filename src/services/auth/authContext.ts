import { createContext } from "react";
import type {
  AuthUser,
  LoginCredentials,
  RegisterCustomerData,
  ForgotPasswordData,
  VerifyResetCodeData,
  ResetPasswordData,
} from "../../features/shared/types";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  signIn(credentials: LoginCredentials): Promise<void>;
  register(data: RegisterCustomerData): Promise<void>;
  signOut(): void;
  refreshUser(): Promise<void>;
  forgotPassword(data: ForgotPasswordData): Promise<void>;
  verifyResetCode(data: VerifyResetCodeData): Promise<string>;
  resetPassword(data: ResetPasswordData): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
