import type {
  AuthSession,
  LoginCredentials,
  RegisterCustomerData,
  ForgotPasswordData,
  VerifyResetCodeData,
  ResetPasswordData,
} from "../../features/shared/types";

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  registerCustomer(data: RegisterCustomerData): Promise<AuthSession>;
  me(): Promise<AuthSession["user"]>;
  forgotPassword(data: ForgotPasswordData): Promise<void>;
  verifyResetCode(data: VerifyResetCodeData): Promise<string>;
  resetPassword(data: ResetPasswordData): Promise<void>;
}
