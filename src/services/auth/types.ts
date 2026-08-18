import type { AuthSession, LoginCredentials, OtpMessageResponse, RegisterCustomerData, SendOtpData, VerifyOtpData, VerifyOtpResponse } from "../../features/shared/types"

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>
  registerCustomer(data: RegisterCustomerData): Promise<AuthSession>
  sendOtp(data: SendOtpData): Promise<OtpMessageResponse>
  verifyOtp(data: VerifyOtpData): Promise<VerifyOtpResponse>
  me(): Promise<AuthSession["user"]>
}
