import type {
  AuthSession,
  LoginCredentials,
  RegisterCustomerData,
  ForgotPasswordData,
  ResetPasswordData,
} from "../../features/shared/types";

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  registerCustomer(data: RegisterCustomerData): Promise<AuthSession>;
  me(): Promise<AuthSession["user"]>;
  forgotPassword(data: ForgotPasswordData): Promise<void>;
  resetPassword(data: ResetPasswordData): Promise<void>;
}
