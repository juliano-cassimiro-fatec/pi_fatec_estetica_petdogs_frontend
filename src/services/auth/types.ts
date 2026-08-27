import type {
  AuthSession,
  LoginCredentials,
  RegisterCustomerData,
} from "../../features/shared/types";

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  registerCustomer(data: RegisterCustomerData): Promise<AuthSession>;
  me(): Promise<AuthSession["user"]>;
}
