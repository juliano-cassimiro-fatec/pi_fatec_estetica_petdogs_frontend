import type { AuthSession } from "../../features/shared/types"

export interface SessionStorage {
  getSession(): AuthSession | null
  saveSession(session: AuthSession): void
  clearSession(): void
  getToken(): string | null
}

const tokenKey = "petshop-token"
const legacyTokenKey = "token"
const userKey = "user"

export const browserSessionStorage: SessionStorage = {
  getSession() {
    const token = this.getToken()
    const storedUser = localStorage.getItem(userKey)

    if (!token || !storedUser) return null

    return { token, user: JSON.parse(storedUser) as AuthSession["user"] }
  },

  saveSession(session) {
    localStorage.setItem(tokenKey, session.token)
    localStorage.setItem(userKey, JSON.stringify(session.user))
  },

  clearSession() {
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(legacyTokenKey)
    localStorage.removeItem(userKey)
  },

  getToken() {
    return localStorage.getItem(tokenKey) ?? localStorage.getItem(legacyTokenKey)
  },
}
