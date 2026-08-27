import type { AuthRepository } from "./types";
import type {
  AuthSession,
  LoginCredentials,
  RegisterCustomerData,
} from "../../features/shared/types";
import apiClient from "../api/client";

interface MeResponse {
  user: AuthSession["user"];
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
};
