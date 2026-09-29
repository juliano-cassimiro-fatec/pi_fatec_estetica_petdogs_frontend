import type { AuthRepository } from "./types";
import type {
  AuthSession,
  LoginCredentials,
  RegisterCustomerData,
  ForgotPasswordData,
  ResetPasswordData,
} from "../../features/shared/types";
import apiClient from "../api/client";

interface MeResponse {
  user: AuthSession["user"];
}

export const axiosAuthRepository: AuthRepository = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post<AuthSession>("/auth/login", credentials, {
      skipAuth: true,
      showGlobalError: false,
    });
    return response.data;
  },

  async registerCustomer(data: RegisterCustomerData) {
    const response = await apiClient.post<AuthSession>("/auth/register", data, {
      skipAuth: true,
      showGlobalError: false,
    });
    return response.data;
  },

  async me() {
    const response = await apiClient.get<MeResponse>("/auth/me");
    return response.data.user;
  },

  async forgotPassword(data: ForgotPasswordData) {
    await apiClient.post("/auth/forgot-password", data, { skipAuth: true, showGlobalError: false });
  },

  async resetPassword(data: ResetPasswordData) {
    await apiClient.post("/auth/reset-password", data, { skipAuth: true, showGlobalError: false });
  },
};
