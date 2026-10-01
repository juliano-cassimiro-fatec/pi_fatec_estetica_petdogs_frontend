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

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  registerCustomer(data: RegisterCustomerData): Promise<RegisterCustomerResponse>;
  verifyEmail(data: VerifyEmailData): Promise<AuthSession>;
  resendEmailVerification(data: ResendEmailVerificationData): Promise<void>;
  me(): Promise<AuthSession["user"]>;
  changePassword(data: ChangePasswordData): Promise<AuthSession>;
  forgotPassword(data: ForgotPasswordData): Promise<void>;
  verifyResetCode(data: VerifyResetCodeData): Promise<string>;
  resetPassword(data: ResetPasswordData): Promise<void>;
}
