import { useState } from "react"
import type { ReactNode } from "react"
import type { AuthSession, LoginCredentials } from "../features/shared/types"
import { authService } from "../services/auth/authService"
import { AuthContext } from "./AuthContextObject"

interface AuthProviderProps {
  children: ReactNode
}

const storedSession = authService.getStoredSession()

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthSession["user"] | null>(storedSession?.user ?? null)
  const [token, setToken] = useState<string | null>(storedSession?.token ?? null)

  const isAuthenticated = Boolean(user && token)

  async function signIn(data: LoginCredentials): Promise<void> {
    const response = await authService.signIn(data)
    setUser(response.user)
    setToken(response.token)
  }

  function signOut(): void {
    authService.signOut()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
