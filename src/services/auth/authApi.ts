import type { AuthRepository } from "./types";
import type {
  AuthSession,
  LoginCredentials,
  RegisterCustomerData,
  ForgotPasswordData,
  VerifyResetCodeData,
  ResetPasswordData,
  ChangePasswordData,
} from "../../features/shared/types";
import apiClient from "../api/client";

interface MeResponse {
  user: AuthSession["user"];
}

interface VerifyResetCodeResponse {
  resetToken: string;
}

export const axiosAuthRepository: AuthRepository = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post<AuthSession>("/auth/login", credentials);
    return response.data;
  },

  async registerCustomer(data: RegisterCustomerData) {
    const response = await apiClient.post<AuthSession>("/auth/register", data);
    return response.data;
  },

  async me() {
    const response = await apiClient.get<MeResponse>("/auth/me");
    return response.data.user;
  },

  async changePassword(data: ChangePasswordData) {
    const response = await apiClient.post<AuthSession>("/auth/change-password", data);
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordData) {
    await apiClient.post("/auth/forgot-password", data, {
      skipAuth: true,
      showGlobalError: false,
    });
  },

  async verifyResetCode(data: VerifyResetCodeData) {
    const response = await apiClient.post<VerifyResetCodeResponse>(
      "/auth/verify-reset-code",
      data,
      {
        skipAuth: true,
        showGlobalError: false,
      },
    );
    return response.data.resetToken;
  },

  async resetPassword(data: ResetPasswordData) {
    await apiClient.post("/auth/reset-password", data, {
      skipAuth: true,
      showGlobalError: false,
    });
  },
};
