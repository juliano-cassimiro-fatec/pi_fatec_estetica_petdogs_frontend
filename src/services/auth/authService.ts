import type { AuthRepository } from "./types"
import type { SessionStorage } from "../session/browserSession"
import type {
  AuthSession,
  LoginCredentials,
  RegisterCustomerData,
} from "../../features/shared/types"

export function createAuthUseCases(
  repository: AuthRepository,
  storage: SessionStorage,
) {
  return {
    hasStoredToken(): boolean {
      return Boolean(storage.getToken())
    },

    getCurrentUser() {
      return repository.me()
    },

    async signIn(credentials: LoginCredentials): Promise<AuthSession> {
      const session = await repository.login(credentials)
      storage.saveSession(session)
      return session
    },

    async registerCustomer(data: RegisterCustomerData): Promise<AuthSession> {
      const session = await repository.registerCustomer(data)
      storage.saveSession(session)
      return session
    },

    signOut(): void {
      storage.clearSession()
    },
  }
}

import { axiosAuthRepository } from "./authApi"
import { browserSessionStorage } from "../session/browserSession"

export const authService = createAuthUseCases(
  axiosAuthRepository,
  browserSessionStorage,
)
