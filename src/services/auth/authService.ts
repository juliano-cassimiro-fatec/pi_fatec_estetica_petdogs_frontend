import type { AuthRepository } from "./types";
import { type SessionStorage } from "../session/browserSession";
import type {
  AuthSession,
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

export function createAuthUseCases(repository: AuthRepository, storage: SessionStorage) {
  return {
    hasStoredToken(): boolean {
      return Boolean(storage.getToken());
    },

    getCurrentUser() {
      return repository.me();
    },

    async changePassword(data: ChangePasswordData): Promise<AuthSession> {
      const session = await repository.changePassword(data);
      storage.saveSession(session);
      return session;
    },

    async signIn(credentials: LoginCredentials): Promise<AuthSession> {
      const session = await repository.login(credentials);
      storage.saveSession(session);
      return session;
    },

    registerCustomer(data: RegisterCustomerData): Promise<RegisterCustomerResponse> {
      return repository.registerCustomer(data);
    },

    async verifyEmail(data: VerifyEmailData): Promise<AuthSession> {
      const session = await repository.verifyEmail(data);
      storage.saveSession(session);
      return session;
    },

    resendEmailVerification(data: ResendEmailVerificationData): Promise<void> {
      return repository.resendEmailVerification(data);
    },

    signOut(): void {
      storage.clearSession();
    },

    forgotPassword(data: ForgotPasswordData): Promise<void> {
      return repository.forgotPassword(data);
    },

    verifyResetCode(data: VerifyResetCodeData): Promise<string> {
      return repository.verifyResetCode(data);
    },

    resetPassword(data: ResetPasswordData): Promise<void> {
      return repository.resetPassword(data);
    },
  };
}

import { axiosAuthRepository } from "./authApi";
import { browserSessionStorage } from "../session/browserSession";

export const authService = createAuthUseCases(axiosAuthRepository, browserSessionStorage);
