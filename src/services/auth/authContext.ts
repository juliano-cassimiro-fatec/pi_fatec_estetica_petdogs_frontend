import { createContext } from "react";
import type {
  AuthUser,
  LoginCredentials,
  RegisterCustomerData,
  RegisterCustomerResponse,
  VerifyEmailData,
  ResendEmailVerificationData,
  ForgotPasswordData,
  VerifyResetCodeData,
  ResetPasswordData,
  ChangePasswordData,
} from "../../features/shared/types";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  signIn(credentials: LoginCredentials): Promise<AuthUser>;
  register(data: RegisterCustomerData): Promise<RegisterCustomerResponse>;
  verifyEmail(data: VerifyEmailData): Promise<AuthUser>;
  resendEmailVerification(data: ResendEmailVerificationData): Promise<void>;
  signOut(): void;
  refreshUser(): Promise<void>;
  forgotPassword(data: ForgotPasswordData): Promise<void>;
  verifyResetCode(data: VerifyResetCodeData): Promise<string>;
  resetPassword(data: ResetPasswordData): Promise<void>;
  changePassword(data: ChangePasswordData): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
